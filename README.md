# CSV Utility Platform

This project was created while I was working as a Data Engineer.

During my day-to-day work, I often had to perform repetitive tasks such as comparing columns between multiple CSV files. Initially, I wrote small Python scripts and saved them in Google Colab. Over time, this became inefficient because I had hundreds of scripts, making it hard to quickly find and reuse the right one.

To solve this, I built this platform — a centralized place where all commonly used CSV utilities are instantly available.

## Key Features

- Quickly compare columns across CSV files  
- Designed for fast, on-demand usage  
- No database involved — data is never stored  
- All uploaded data exists only in memory  
- Data is automatically deleted once the session ends  

## Security & Privacy

This platform is safe to use with client data. Since there is no database and no persistent storage, files are processed in-memory only and are removed as soon as the session ends.

## Use Case

Ideal for data engineers, analysts, or anyone who frequently works with CSV files and needs quick, reliable tools without worrying about data retention.

## Live Demo

🔗 **Live Site:** https://analyzr-z1.vercel.app/
