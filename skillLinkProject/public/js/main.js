const checkboxes = document.querySelectorAll('.post-checkbox');
const deleteButton = document.getElementById('remove-button');
const removeFirstButton = document.querySelector('form[action="/remove-first"] button');
const removeLastButton = document.querySelector('form[action="/remove-last"] button');
const removeByRatingButton = document.querySelector('#remove-by-rating-form button');

function updateButtons() {
    const hasChecked = Array.from(checkboxes).some(chk => chk.checked);
    deleteButton.disabled = !hasChecked;

    if (removeFirstButton && removeLastButton) {
        removeFirstButton.disabled = hasChecked;
        removeLastButton.disabled = hasChecked;
    }

    if (removeByRatingButton) {
        removeByRatingButton.disabled = hasChecked;
    }
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateButtons);
});

document.addEventListener('DOMContentLoaded', () => {
    updateButtons();
});

const errorMessage = document.getElementById("error-message");
if (errorMessage) {
    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 3000);
}

async function removeImage(postTitle) {
    try {
        const response = await fetch(`/remove-image/${postTitle}`, { method: "POST" });
        const result = await response.json();

        if (result.success) {
            document.getElementById("image-container").remove();

            // สร้าง input file ใหม่แล้วแทรกลงในฟอร์ม
            const imageUploadInput = document.createElement("input");
            imageUploadInput.type = "file";
            imageUploadInput.name = "postImgUrl";
            imageUploadInput.accept = "image/*";
            imageUploadInput.id = "image-upload";

            const form = document.getElementById("edit-post-form");
            form.insertBefore(imageUploadInput, form.children[form.children.length - 2]);
        } else {
            alert("Failed to remove image.");
        }
    } catch (error) {
        console.error("Error removing image:", error);
    }
}

const stars = document.querySelectorAll('.star');
stars.forEach((star, index) => {
    // Hover
    star.addEventListener('mouseenter', () => {
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('hovered');
        }
    });
    star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hovered'));
    });

    // Click (select)
    star.addEventListener('click', () => {
        stars.forEach(s => s.classList.remove('selected'));
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('selected');
        }
    });
});

function handleDeleteImage() {
    const container = document.getElementById("image-container");
    const deleteField = document.getElementById("deleteImg");

    // Ensure the container and hidden delete field exist before proceeding
    if (container && deleteField) {
        // Remove the image container
        container.remove();

        // Set the hidden field to true to indicate image deletion
        deleteField.value = "true";

        // Create a new file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.name = "postImgUrl";
        fileInput.accept = "image/*";
        fileInput.className = "form-control mt-3";
        fileInput.id = "image-upload";

        // Find the form and the submit button
        const form = document.getElementById("edit-post-form");
        const submitButton = form.querySelector("button[type='submit']");

        // Insert the new file input before the submit button
        form.insertBefore(fileInput, submitButton);
    }
}
function handleDeleteImage() {
    const container = document.getElementById("image-container");
    const deleteField = document.getElementById("deleteImg");

    if (container && deleteField) {
        container.remove();
        deleteField.value = "true"; e

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.name = "postImgUrl";
        fileInput.accept = "image/*";
        fileInput.id = "image-upload";

        const form = document.getElementById("edit-post-form");
        const submitButton = form.querySelector("button[type='submit']");
        form.insertBefore(fileInput, submitButton);
    }
}
