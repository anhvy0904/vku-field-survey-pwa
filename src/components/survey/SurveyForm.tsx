import React, { useState } from 'react';
import type { Survey, SurveyCondition } from '../../types/survey';
import { Button } from '../ui/Button';
import { Save, AlertCircle } from 'lucide-react';

interface SurveyFormProps {
  onSubmit: (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => void;
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
  const [formData, setFormData] = useState({
    building: '',
    room: '',
    facilityType: '',
    condition: 'Good' as SurveyCondition,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.building.trim()) newErrors.building = 'Building is required';
    if (!formData.room.trim()) newErrors.room = 'Room is required';
    if (!formData.facilityType.trim()) newErrors.facilityType = 'Facility type is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (formData.description.length > 500) newErrors.description = 'Description must be under 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate slight processing delay
    setTimeout(() => {
      onSubmit(formData);
      
      // Reset form
      setFormData({
        building: '',
        room: '',
        facilityType: '',
        condition: 'Good',
        description: ''
      });
      setIsSubmitting(false);
    }, 400);
  };

  const inputStyle = (hasError: boolean) => ({
    padding: '0.75rem', 
    borderRadius: 'var(--radius-md)', 
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border-color)'}`,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    fontFamily: 'inherit'
  });

  const labelStyle = { 
    fontWeight: 500, 
    fontSize: '0.875rem',
    marginBottom: '0.375rem',
    display: 'block'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="building" style={labelStyle}>Building <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input 
            type="text" 
            id="building"
            name="building"
            placeholder="e.g. Building A"
            value={formData.building}
            onChange={handleChange}
            style={inputStyle(!!errors.building)}
          />
          <InputError message={errors.building} />
        </div>

        <div>
          <label htmlFor="room" style={labelStyle}>Room <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input 
            type="text" 
            id="room"
            name="room"
            placeholder="e.g. A-101"
            value={formData.room}
            onChange={handleChange}
            style={inputStyle(!!errors.room)}
          />
          <InputError message={errors.room} />
        </div>
      </div>

      <div>
        <label htmlFor="facilityType" style={labelStyle}>Facility Type <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input 
          type="text" 
          id="facilityType"
          name="facilityType"
          placeholder="e.g. Air Conditioner, Projector"
          value={formData.facilityType}
          onChange={handleChange}
          style={inputStyle(!!errors.facilityType)}
        />
        <InputError message={errors.facilityType} />
      </div>

      <div>
        <label htmlFor="condition" style={labelStyle}>Condition <span style={{ color: 'var(--danger)' }}>*</span></label>
        <select 
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          style={{...inputStyle(!!errors.condition), backgroundColor: 'white'}}
        >
          <option value="Good">Good</option>
          <option value="Needs Repair">Needs Repair</option>
          <option value="Broken">Broken</option>
        </select>
        <InputError message={errors.condition} />
      </div>

      <div>
        <label htmlFor="description" style={labelStyle}>Description (Optional)</label>
        <textarea 
          id="description"
          name="description"
          rows={3}
          placeholder="Describe any issues..."
          value={formData.description}
          onChange={handleChange}
          style={{...inputStyle(!!errors.description), resize: 'vertical'}}
        />
        <InputError message={errors.description} />
      </div>

      <Button type="submit" disabled={isSubmitting} fullWidth style={{ marginTop: '0.5rem' }}>
        <Save size={18} style={{ marginRight: '0.5rem' }} />
        {isSubmitting ? 'Saving Survey...' : 'Submit Survey'}
      </Button>
    </form>
  );
};
