// ... existing code ...

// Add this new route
router.post('/upload-demand-draft', 
  upload.single('document'),
  auth,
  personalController.uploadDemandDraft
);

// ... existing code ... 