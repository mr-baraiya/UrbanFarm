import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiRepeatLine } from 'react-icons/ri';
import { TASK_TYPES, TASK_PRIORITIES } from '../../utils/constants';
import { useNotification } from '../../hooks/useNotification';
import { validateTaskForm } from '../../utils/validators';
import { getLocalizedDynamicText } from '../../utils/localizationHelper';
import './TaskForm.css';

const TaskForm = ({ task, onClose, onSubmit, plants, gardens }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    dueDate: '',
    plantId: '',
    gardenId: '',
    recurring: false,
    recurringInterval: 3,
    recurringUnit: 'days',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        type: task.type || 'other',
        priority: task.priority || 'medium',
        dueDate: task.dueDate?.slice(0, 10) || '',
        plantId: task.plantId?._id || task.plantId || '',
        gardenId: task.gardenId?._id || task.gardenId || '',
        recurring: task.recurring || false,
        recurringInterval: task.recurringInterval || 3,
        recurringUnit: task.recurringUnit || 'days',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: formErrors } = validateTaskForm(formData);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
        dueDate: formData.dueDate,
        plantId: formData.plantId || undefined,
        gardenId: formData.gardenId || undefined,
        recurring: formData.recurring,
        recurringInterval: formData.recurring ? formData.recurringInterval : undefined,
        recurringUnit: formData.recurring ? formData.recurringUnit : undefined,
      };
      
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedTypeLabel = (typeValue) => {
    const map = {
      watering: t('schedule.typeWatering', 'Watering'),
      fertilizing: t('schedule.typeFertilizing', 'Fertilizing'),
      planting: t('schedule.typePlanting', 'Planting'),
      harvesting: t('schedule.typeHarvesting', 'Harvesting'),
      pruning: t('schedule.typePruning', 'Pruning'),
      pest_check: t('schedule.typePestCheck', 'Pest Check'),
      other: t('schedule.typeOther', 'Other'),
    };
    return map[typeValue] || typeValue;
  };

  const getTranslatedPriorityLabel = (priorityValue) => {
    const map = {
      low: t('schedule.priorityLow', 'Low'),
      medium: t('schedule.priorityMedium', 'Medium'),
      high: t('schedule.priorityHigh', 'High'),
    };
    return map[priorityValue] || priorityValue;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-form-header">
          <h3>{task?._id ? t('schedule.editTaskModal', 'Edit Task') : t('schedule.createNewTask', 'Create New Task')}</h3>
          <button className="task-modal-close" onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-compact-form" noValidate>
          <div className="form-group">
            <label>{t('schedule.taskTitleLabel', 'Task Title *')}</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('schedule.taskTitlePlaceholder', 'What needs to be done?')}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>{t('schedule.descriptionLabel', 'Description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('schedule.descriptionPlaceholder', 'Add details...')}
              rows="1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('schedule.categoryLabel', 'Category')}</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TASK_TYPES.map((typeItem) => (
                  <option key={typeItem.value} value={typeItem.value}>
                    {getTranslatedTypeLabel(typeItem.value)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t('schedule.priorityLabel', 'Priority')}</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {getTranslatedPriorityLabel(p.value)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('schedule.gardenOptional', 'Garden (optional)')}</label>
              <select name="gardenId" value={formData.gardenId} onChange={handleChange}>
                <option value="">{t('schedule.noneOption', 'None')}</option>
                {gardens?.map((g) => (
                  <option key={g._id} value={g._id}>
                    {getLocalizedDynamicText(g.name, i18n.language)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('schedule.plantOptional', 'Plant (optional)')}</label>
              <select name="plantId" value={formData.plantId} onChange={handleChange}>
                <option value="">{t('schedule.noneOption', 'None')}</option>
                {plants?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {getLocalizedDynamicText(p.name, i18n.language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row form-row-align-end">
            <div className="form-group">
              <label>{t('schedule.dueDateLabel', 'Due Date *')}</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.dueDate ? 'input-error' : ''}
              />
              {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label recurring-checkbox-card">
                <input
                  type="checkbox"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleChange}
                />
                <span className="recurring-label-text">
                  <RiRepeatLine /> {t('schedule.recurringTask', 'Recurring Task')}
                </span>
              </label>
            </div>
          </div>

          {formData.recurring && (
            <div className="form-row recurring-config-row">
              <div className="form-group">
                <label>{t('schedule.repeatEvery', 'Repeat Every')}</label>
                <input
                  type="number"
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleChange}
                  min="1"
                  max="30"
                />
              </div>
              <div className="form-group">
                <label>{t('schedule.unit', 'Unit')}</label>
                <select name="recurringUnit" value={formData.recurringUnit} onChange={handleChange}>
                  <option value="days">{t('schedule.unitDays', 'Days')}</option>
                  <option value="weeks">{t('schedule.unitWeeks', 'Weeks')}</option>
                  <option value="months">{t('schedule.unitMonths', 'Months')}</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('schedule.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('schedule.saving', 'Saving...') : task ? t('schedule.updateTask', 'Update Task') : t('schedule.createTask', 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;