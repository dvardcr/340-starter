function validateReviewText(originalText) {
    const textarea = document.getElementById('review_text');

    // Check if the textarea content is the same as the original
    if (textarea.value.trim() === originalText.trim()) {
        alert("You must change the review text before submitting.");
        return false; // Prevent form submission
    }

    return true; // Allow form submission
}
