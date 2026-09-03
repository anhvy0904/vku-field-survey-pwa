import React, { useState, useEffect, useRef } from 'react';
import type { SurveyDraft, SurveyCategory } from '../../types/survey';
import { Button } from '../ui/Button';
import { Save, AlertCircle, ArrowLeft, ArrowRight, Camera } from 'lucide-react';
import { draftRepository } from '../../db/draftRepository';
import { cameraService } from '../../services/cameraService';
import { Capacitor } from '@capacitor/core';
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

  // Load draft on mount
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    
    draftRepository.getDraft('current-draft').then(draft => {
      if (draft) {
        setFormData(draft);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
      }
      setIsLoaded(true);
    }).catch(err => {
      console.error('Failed to load draft', err);
      setIsLoaded(true);
    });
  }, []);

  // Save draft on every change
  useEffect(() => {
    if (!isLoaded) return;
    const saveTimer = setTimeout(() => {
      draftRepository.saveDraft({
        ...formData,
        updatedAt: Date.now(),
        currentStep
      }).catch(console.error);
    }, 300); // Debounce save
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
    }
    if (step === 3) {
      if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating is required';
    }
    // Step 4 is photo, which is optional for now based on requirements
    
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
          
          // Compress web fallback to 0.7 JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, photo: dataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    
    // Simulate slight processing delay
    setTimeout(async () => {
      onSubmit(formData);
      
      // Clear draft
      await draftRepository.deleteDraft('current-draft');
      
      // Reset form
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
      setCurrentStep(1);
      setIsSubmitting(false);
    }, 400);
  };

  if (!isLoaded) return <div>Loading...</div>;

  const inputStyle = (hasError: boolean) => ({
    padding: '0.75rem', 
    borderRadius: 'var(--radius-md)', 
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border-color)'}`,
    outline: 'none',
    transition: 'border-color 0.2s',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
        Step {currentStep} / 4
      </div>

      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s' }}>
          <label style={labelStyle}>Category <span style={{ color: 'var(--danger)' }}>*</span></label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {categories.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: formData.category === cat ? 'var(--bg-color)' : 'white' }}>
                <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleChange} />
                {cat}
              </label>
            ))}
          </div>
          <InputError message={errors.category} />
        </div>
      )}

      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s' }}>
          <div>
            <label style={labelStyle}>Condition Rating <span style={{ color: 'var(--danger)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: formData.rating >= star ? 'var(--primary)' : 'white', color: formData.rating >= star ? 'white' : 'var(--text-main)', cursor: 'pointer' }}
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

      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s' }}>
          <label style={labelStyle}>Camera Photo</label>
          {formData.photo ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <img src={formData.photo} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '300px', objectFit: 'cover' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="button" onClick={() => isNative ? handleNativeCamera() : fileInputRef.current?.click()} style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                   Retake Photo
                </Button>
                <Button type="button" onClick={() => setFormData(prev => ({...prev, photo: ''}))} style={{ flex: 1, backgroundColor: 'white', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                   Remove
                </Button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => isNative ? handleNativeCamera() : fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-color)', cursor: 'pointer' }}>
              <Camera size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
                {isNative ? 'Take Photo' : 'Upload Photo'}
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {currentStep > 1 && (
          <Button type="button" onClick={handleBack} style={{ flex: 1, backgroundColor: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            <ArrowLeft size={18} style={{ marginRight: '0.25rem' }} /> Back
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button type="button" onClick={handleNext} style={{ flex: 2 }}>
            Next <ArrowRight size={18} style={{ marginLeft: '0.25rem' }} />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} style={{ flex: 2 }}>
            <Save size={18} style={{ marginRight: '0.5rem' }} />
            {isSubmitting ? 'Saving...' : 'Submit Inspection'}
          </Button>
        )}
      </div>

    </div>
  );
};
