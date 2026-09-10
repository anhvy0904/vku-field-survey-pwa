import React, { useState, useEffect, useRef } from 'react';
import type { SurveyDraft, SurveyCategory, LocationStatus } from '../../types/survey';
import { Button } from '../ui/Button';
import { AlertCircle, ArrowLeft, ArrowRight, Camera, MapPin, CheckCircle2, Cloud, HardDrive } from 'lucide-react';
import { draftRepository } from '../../db/draftRepository';
import { cameraService } from '../../services/cameraService';
import { locationService } from '../../services/locationService';
import { Capacitor } from '@capacitor/core';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface SurveyFormProps {
  onSubmit: (survey: Omit<SurveyDraft, 'id' | 'updatedAt' | 'currentStep'>) => void;
}

const InputError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', animation: 'fadeIn 0.2s' }}>
      <AlertCircle size={12} />
      <span>{message}</span>
    </div>
  );
};

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const isOnline = useNetworkStatus();

  const [formData, setFormData] = useState<SurveyDraft>(() => ({
    id: 'current-draft',
    building: '',
    floor: '',
    room: '',
    category: '',
    rating: 0,
    defectNotes: '',
    photo: '',
    updatedAt: Date.now(),
    currentStep: 1
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialLoadDone = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();

  const handleNativeCamera = async () => {
    const photoData = await cameraService.takePhoto();
    if (photoData) {
      setFormData(prev => ({ ...prev, photo: photoData }));
    }
  };

  const handleFetchLocation = async () => {
    setLocationStatus('fetching');
    const result = await locationService.getCurrentPosition();
    
    setFormData(prev => ({
      ...prev,
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: result.accuracy,
      altitude: result.altitude,
      heading: result.heading,
      speed: result.speed,
      locationCapturedAt: result.capturedAt,
      locationStatus: result.locationStatus
    }));

    setLocationStatus(result.locationStatus);
  };

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    
    draftRepository.getDraft('current-draft').then(draft => {
      if (draft && draft.building) {
        setFormData(draft);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        if (draft.latitude && draft.longitude) setLocationStatus('captured');
      }
      setIsLoaded(true);
    }).catch(err => {
      console.error('Failed to load draft', err);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    setSaveStatus('saving');
    const saveTimer = setTimeout(() => {
      draftRepository.saveDraft({
        ...formData,
        updatedAt: Date.now(),
        currentStep
      }).then(() => setSaveStatus('saved')).catch(console.error);
    }, 500); 
    return () => clearTimeout(saveTimer);
  }, [formData, currentStep, isLoaded]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.building.trim()) newErrors.building = 'Building is required';
      if (!formData.floor.trim()) newErrors.floor = 'Floor is required';
      if (!formData.room.trim()) newErrors.room = 'Room is required';
    }
    if (step === 2) {
      if (!formData.category) newErrors.category = 'Category is required';
      if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, photo: dataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    setTimeout(async () => {
      onSubmit(formData);
      
      setFormData({
        id: 'current-draft',
        building: '',
        floor: '',
        room: '',
        category: '',
        rating: 0,
        defectNotes: '',
        photo: '',
        updatedAt: Date.now(),
        currentStep: 1
      });
      setLocationStatus('idle');
      setCurrentStep(1);
      setIsSubmitting(false);
    }, 400);
  };

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading form...</div>;

  const inputStyle = (hasError: boolean) => ({
    padding: '0.75rem', 
    borderRadius: 'var(--radius-md)', 
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border-color)'}`,
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    backgroundColor: 'white'
  });

  const labelStyle = { 
    fontWeight: 500, 
    fontSize: '0.875rem',
    marginBottom: '0.375rem',
    display: 'block'
  };

  const categories: SurveyCategory[] = ['Hardware', 'Projector', 'AC', 'Electrical', 'Furniture'];
  const steps = ['Facility', 'Inspection', 'Photos', 'Location', 'Review'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          <span>Step {currentStep} of 5: {steps[currentStep - 1]}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><CheckCircle2 size={12} color="var(--success)"/> Saved</> : ''}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${(currentStep / 5) * 100}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {currentStep === 1 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="building" style={labelStyle}>Building <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" id="building" name="building" value={formData.building} onChange={handleChange} style={inputStyle(!!errors.building)} placeholder="e.g. Building A" />
            <InputError message={errors.building} />
          </div>
          <div>
            <label htmlFor="floor" style={labelStyle}>Floor <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" id="floor" name="floor" value={formData.floor} onChange={handleChange} style={inputStyle(!!errors.floor)} placeholder="e.g. 1st Floor" />
            <InputError message={errors.floor} />
          </div>
          <div>
            <label htmlFor="room" style={labelStyle}>Room # <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" id="room" name="room" value={formData.room} onChange={handleChange} style={inputStyle(!!errors.room)} placeholder="e.g. A-101" />
            <InputError message={errors.room} />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Category <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {categories.map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: `1px solid ${formData.category === cat ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: formData.category === cat ? 'var(--surface-secondary)' : 'white' }}>
                  <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleChange} style={{ display: 'none' }} />
                  {cat}
                </label>
              ))}
            </div>
            <InputError message={errors.category} />
          </div>

          <div>
            <label style={labelStyle}>Condition Rating <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `1px solid ${formData.rating >= star ? 'var(--primary)' : 'var(--border-color)'}`, backgroundColor: formData.rating >= star ? 'var(--primary)' : 'white', color: formData.rating >= star ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
                >
                  {star}★
                </button>
              ))}
            </div>
            <InputError message={errors.rating} />
          </div>

          <div>
            <label htmlFor="defectNotes" style={labelStyle}>Defect Notes</label>
            <textarea id="defectNotes" name="defectNotes" rows={3} value={formData.defectNotes} onChange={handleChange} style={{...inputStyle(false), resize: 'vertical'}} placeholder="Describe any issues..." />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={labelStyle}>Camera Photo</label>
          {formData.photo ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <img src={formData.photo} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '300px', objectFit: 'cover' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="button" onClick={() => isNative ? handleNativeCamera() : fileInputRef.current?.click()} style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                   Retake Photo
                </Button>
                <Button type="button" onClick={() => {
                  if(window.confirm("Remove this photo?")) setFormData(prev => ({...prev, photo: ''}))
                }} style={{ flex: 1, backgroundColor: 'white', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                   Remove
                </Button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => isNative ? handleNativeCamera() : fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', backgroundColor: 'var(--surface-secondary)', cursor: 'pointer' }}>
              <Camera size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {isNative ? 'Take Photo' : 'Upload Photo'}
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </div>
      )}

      {currentStep === 4 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              <MapPin size={24} color={locationStatus === 'captured' ? 'var(--primary)' : 'var(--text-muted)'} />
              GPS Location
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              {locationStatus === 'captured' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Latitude:</strong> {formData.latitude?.toFixed(5)}</div>
                  <div><strong>Longitude:</strong> {formData.longitude?.toFixed(5)}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Accuracy:</strong> ±{Math.round(formData.accuracy || 0)}m</div>
                </div>
              ) : locationStatus === 'fetching' ? (
                <div style={{ color: 'var(--primary)' }}>Acquiring location...</div>
              ) : locationStatus === 'denied' ? (
                <div style={{ color: 'var(--danger)' }}>Permission denied. Check device settings.</div>
              ) : locationStatus === 'timeout' ? (
                <div style={{ color: 'var(--warning)' }}>Request timed out. Please try again.</div>
              ) : locationStatus === 'unavailable' ? (
                <div style={{ color: 'var(--danger)' }}>Location unavailable on this device.</div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>Not captured yet.</div>
              )}
            </div>

            <Button type="button" onClick={handleFetchLocation} disabled={locationStatus === 'fetching'} style={{ width: '100%', backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
              {locationStatus === 'fetching' ? 'Fetching...' : locationStatus === 'captured' ? 'Refresh Location' : 'Capture Location'}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>1. Facility</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div><strong>Building:</strong> {formData.building || <span style={{ color: 'var(--danger)' }}>Missing</span>}</div>
              <div><strong>Floor:</strong> {formData.floor || <span style={{ color: 'var(--danger)' }}>Missing</span>}</div>
              <div><strong>Room:</strong> {formData.room || <span style={{ color: 'var(--danger)' }}>Missing</span>}</div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>2. Inspection</h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div><strong>Category:</strong> {formData.category || <span style={{ color: 'var(--danger)' }}>Missing</span>}</div>
              <div><strong>Rating:</strong> {formData.rating > 0 ? `${formData.rating}/5` : <span style={{ color: 'var(--danger)' }}>Missing</span>}</div>
              {formData.defectNotes && <div><strong>Notes:</strong> {formData.defectNotes}</div>}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>3. Photo & GPS</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div><strong>Photo:</strong> {formData.photo ? 'Attached ✓' : 'None'}</div>
              <div><strong>GPS:</strong> {formData.latitude ? 'Captured ✓' : 'Not captured'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {currentStep > 1 && (
          <Button type="button" onClick={handleBack} style={{ flex: 1, backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft size={18} style={{ marginRight: '0.25rem' }} /> Back
          </Button>
        )}
        
        {currentStep < 5 ? (
          <Button type="button" onClick={handleNext} style={{ flex: 2 }}>
            Next <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !formData.building || !formData.floor || !formData.room || !formData.category || !formData.rating} style={{ flex: 2, backgroundColor: isOnline ? 'var(--primary)' : 'var(--warning)', color: isOnline ? 'white' : '#1f2937' }}>
            {isOnline ? <Cloud size={18} style={{ marginRight: '0.5rem' }} /> : <HardDrive size={18} style={{ marginRight: '0.5rem' }} />}
            {isSubmitting ? 'Saving...' : isOnline ? 'Submit Inspection' : 'Save for Sync'}
          </Button>
        )}
      </div>

    </div>
  );
};
