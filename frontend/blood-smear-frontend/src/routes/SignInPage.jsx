import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UCDavisNavbar from '../Component/UCDavisNavbar';
import ucdavisLogo from '../assets/ucdavis_logo_blue.png';
import './SignInPage.css';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Handle form submission here
        console.log('Form submitted:', formData);
        alert('Sign in successful! Welcome back to the Blood Smear Database.');
      } catch (error) {
        console.error('Sign in error:', error);
        alert('Sign in failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="signin-page">
      <UCDavisNavbar />
      
      <div className="signin-container">
        <div className="signin-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Blood Smear Database account</p>
        </div>

        <div className="signin-form-container">
          <form onSubmit={handleSubmit} className="signin-form">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter your UC Davis email"
                  autoComplete="email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Remember me for 30 days
                </label>
                
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="signin-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="register-prompt">
                Don't have an account? <Link to="/register" className="register-link">Create Account</Link>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
