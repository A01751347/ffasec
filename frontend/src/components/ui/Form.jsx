// frontend/src/components/ui/Form.jsx
import React from 'react';
import Button from './Button';

const Form = ({
  onSubmit,
  children,
  submitText = 'Guardar',
  resetText = 'Cancelar',
  showReset = true,
  onReset,
  isSubmitting = false,
  submitButtonProps = {},
  resetButtonProps = {},
  className = '',
  footerClassName = '',
  footerAlign = 'end', // start, center, end, between, around, evenly
  ...props
}) => {
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Handle form reset
  const handleReset = (e) => {
    if (onReset) {
      onReset(e);
    } else {
      e.target.form.reset();
    }
  };

  // Footer alignment classes
  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      {/* Form content */}
      {children}

      {/* Form footer with submit/reset buttons */}
      <div className={`mt-6 flex flex-wrap gap-3 ${alignmentClasses[footerAlign] || 'justify-end'} ${footerClassName}`}>
        {showReset && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting}
            {...resetButtonProps}
          >
            {resetText}
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          {...submitButtonProps}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default Form;