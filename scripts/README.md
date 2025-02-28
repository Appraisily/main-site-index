# Appraiser Image Generation Scripts

These scripts automate the process of generating profile images for art appraisers in the directory.

## Quick Start

Run these commands in order:

1. **Create test data** (optional, only if you need sample data):
   ```
   npm run create-test
   ```

2. **Identify appraisers who need images**:
   ```
   npm run identify
   ```

3. **Generate images for identified appraisers**:
   ```
   npm run generate
   ```

## Detailed Instructions

### Step 1: Prepare Appraiser Data

Ensure that your appraiser data is in the correct format in `data/appraisers.json`. The file should have this structure:

```json
{
  "appraisers": [
    {
      "id": "unique-id",
      "firstName": "First",
      "lastName": "Last",
      "company": "Company Name",
      "state": "State",
      "licenseNumber": "License",
      "specialties": ["Specialty1", "Specialty2"],
      "imageUrl": "" // Will be populated by the script
    },
    // more appraisers...
  ]
}
```

If you don't have this file yet, you can create sample data with:
```
npm run create-test
```

### Step 2: Identify Appraisers Needing Images

Run:
```
npm run identify
```

This will:
- Scan the appraisers data
- Identify which appraisers don't have image URLs
- Create a file at `temp/appraisers-needing-images.json` with the list

Check this file to confirm which appraisers will have images generated.

### Step 3: Generate Images

Run:
```
npm run generate
```

This will:
- Read the list of appraisers needing images
- Process them in batches
- Make API calls to the image generation service
- Update the original appraisers.json file with the new image URLs
- Create a backup of the original data before making changes
- Generate a log file with detailed results

### Step 4: Verify Results

- Check `logs/image-generation-[timestamp].json` for detailed results
- Verify that `data/appraisers.json` has been updated with image URLs
- Review any errors in the console output

## Configuration

The scripts use these URLs and settings:

- **Image Service**: https://image-generation-service-856401495068.us-central1.run.app/api/generate
- **Batch Size**: 5 appraisers per batch
- **Max Concurrency**: 3 simultaneous API calls
- **API Call Delay**: 3000ms between batches

To modify these settings, edit the CONFIG object in `scripts/generate-appraiser-images.js`.

## Troubleshooting

- **Script cannot find appraisers.json**: Update the file path in the script
- **API calls failing**: Check if the image generation service is running
- **Images not being generated**: Check the API response in the logs
- **Timeouts**: Increase the timeout value in the generateImageForAppraiser function

## How It Works

1. The identify script finds appraisers without images (empty `imageUrl`)
2. The generate script sends each appraiser's data to the image generation service
3. The service creates a profile image based on the appraiser information
4. The image URL is saved back to the appraiser's data
5. All images are stored in ImageKit CDN for fast delivery

## Need Help?

If you encounter any issues, check the console output and log files for error messages. 