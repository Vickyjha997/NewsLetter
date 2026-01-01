# How to Download Your LinkedIn Profile as PDF

Since LinkedIn requires authentication, you'll need to download your profile manually. Here's how:

## Step-by-Step Guide

### Option 1: Download Full Profile Data (Recommended)

1. **Go to LinkedIn Settings**
   - Click your profile picture (top right)
   - Select "Settings & Privacy"

2. **Navigate to Data Privacy**
   - Click "Data privacy" in the left sidebar
   - Find "Get a copy of your data"

3. **Request Your Data**
   - Click "Request archive"
   - Select **"Profile"** (uncheck other options for faster download)
   - Click "Request archive"

4. **Download the PDF**
   - LinkedIn will email you when ready (usually 10-15 minutes)
   - Click the download link in the email
   - Extract the ZIP file
   - Find `Profile.pdf` inside

5. **Save to Test Location**
   - Copy `Profile.pdf` to: `storage/linkedin-pdfs/test.pdf`

### Option 2: Quick Profile View (Alternative)

1. **Visit Your Profile**
   - Go to: https://www.linkedin.com/in/vicky-jha-2606a2208
   - Click "More" button
   - Select "Save to PDF"

2. **Save the File**
   - Save as: `storage/linkedin-pdfs/test.pdf`

## After Download

Run the test script:
```bash
npm run test-linkedin-pdf
```

This will:
- ✅ Read the PDF
- ✅ Extract text content
- ✅ Use Gemini AI to find achievements
- ✅ Display results in console

## What the Script Will Find

The Gemini AI will look for:
- 🎓 New positions/promotions
- 🏆 Awards and recognitions  
- 📚 Publications or speaking engagements
- 📜 Certifications earned
- 💼 Notable projects completed

---

**Note**: For now, please download manually using one of the options above. Once you have the PDF saved, I'll analyze it immediately!
