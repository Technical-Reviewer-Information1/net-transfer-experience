# Task Completion Checklist

## When Modifying the Web Application

### Code Quality
- [ ] Ensure code follows existing naming conventions (snake_case)
- [ ] Maintain Japanese language for all user-facing text
- [ ] Keep consistent indentation and formatting
- [ ] Add appropriate comments where necessary

### Testing
- [ ] Test the application locally: `streamlit run app.py`
- [ ] Verify all interactive elements work correctly
- [ ] Check responsive behavior across different screen sizes
- [ ] Test edge cases (large files, slow networks, etc.)

### Streamlit Specific Checks
- [ ] Verify session state management works correctly
- [ ] Test that page refreshes don't break functionality
- [ ] Ensure custom CSS still applies correctly
- [ ] Check that all widgets respond properly

### Performance
- [ ] Monitor memory usage with large datasets
- [ ] Ensure smooth animations and transitions
- [ ] Verify real-time updates work without lag

### Final Steps
- [ ] Run the application and perform end-to-end testing
- [ ] Check browser console for any JavaScript errors
- [ ] Verify the app works on the expected port (8501)
- [ ] Document any new features or changes made