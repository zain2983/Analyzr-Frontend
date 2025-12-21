# Contributing Guide

Thanks for your interest in contributing to this project 🚀  
This project is an in-browser CSV analytics and exploration tool built for data engineers and analysts.

The goal is to keep the codebase **clean, readable, and practical**, while gradually expanding features in a structured way.

---

## 📌 Project Status

### ✅ Things Already Done

The following core features are already implemented:

- **CSV Basics Tab**
  - CSV upload
  - Dataset metadata (rows, columns, column names)
- **EDA Tab**
  - Basic exploratory data analysis
  - Null checks
  - Column-level summaries
- **Compare Tab**
  - Schema comparison between CSVs
  - Column presence and type checks

These form the foundation of the application.

---

## 🚧 Things That Need to Be Done (To-Dos)

### 🔹 Data Operations
- Filtering
- Group by
- Aggregations
- Column-based operations

---

### 🔹 Visualizations
- Improve existing charts
- Add more chart types (bar, histogram, pie, etc.)
- Handle large categorical columns gracefully
- Improve responsiveness and UX

---

### 🔹 Data Cleaning Tab
Frontend:
- Drop columns
- Handle null values
- Deduplication
- Normalization

Backend:
- Implement cleaning logic using Pandas / NumPy
- Return before/after stats
- Ensure operations are session-based (in-memory)

---

### 🔹 Merge & Join Tab
Frontend:
- Join UI (left, right, inner, outer)
- Column selection
- Join preview

Backend:
- Join logic using Pandas
- Schema validation
- Join safety checks

---

### 🔹 Transform Tab
Frontend:
- Rename columns
- Type casting
- Derived columns

Backend:
- Transformation pipeline
- Validation and error handling
- In-memory dataset mutation

---

## 🔌 Backend Development

The backend is built using **FastAPI** and handles:
- CSV ingestion
- In-memory dataset management
- EDA computations
- Data operations and transformations

If you are working on backend-related features, refer to the backend directory/repository here:

👉 **Backend code:**  
`/backend` (or corresponding backend repository)

> Note: The backend is intentionally stateless and does not persist data to any database.

---

## 🧠 Contribution Guidelines

- Keep changes **small and focused**
- Prefer clarity over cleverness
- Avoid introducing paid services or storage
- Follow existing code structure
- Add comments where logic is non-obvious

---

## 🧪 Testing & Validation

- Test with multiple CSV files
- Validate behavior on:
  - Small datasets
  - Medium datasets
  - Edge cases (empty columns, mixed types)

---

## 📣 Suggestions & Discussions

If you have ideas for improvements or new features:
- Open an issue
- Clearly describe the problem and expected behavior
- Keep suggestions aligned with the project’s goal:  
  **lightweight, in-memory CSV analytics**

---

Thanks again for contributing 🙌  
Every improvement makes this tool more useful and robust.
