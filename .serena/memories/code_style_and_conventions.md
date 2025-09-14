# Code Style and Conventions

## Code Structure
- **Single File Application**: All functionality contained in `app.py`
- **Japanese Comments**: UI text and comments are in Japanese
- **Streamlit Patterns**: Uses standard Streamlit components and session state

## Naming Conventions
- **Functions**: Snake_case (e.g., `format_size`, `calculate_transfer_time`)
- **Variables**: Snake_case (e.g., `file_size`, `network_speeds`)
- **Constants**: Upper case for dictionaries (e.g., `file_types`, `network_speeds`)

## UI/UX Patterns
- **Custom CSS**: Embedded styles for better visual presentation
- **Japanese Interface**: All user-facing text in Japanese
- **Wide Layout**: Uses Streamlit's wide layout configuration
- **Interactive Elements**: Extensive use of Streamlit widgets (selectbox, slider, etc.)

## Session State Management
- Uses `st.session_state` for:
  - `transfer_history`: List of previous transfers
  - `is_transferring`: Boolean flag for transfer status

## Code Organization
- Import statements at the top
- Page configuration immediately after imports
- Custom CSS definition
- Session state initialization
- Helper functions
- Main application logic