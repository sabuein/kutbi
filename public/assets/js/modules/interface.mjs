"use strict";

const updateImageDisplay = (input, output) => {
    try {
        while (output.firstChild) output.removeChild(output.firstChild);

        const currentFiles = input.files;
        if (currentFiles.length === 0) {
            const para = document.createElement("p");
            para.textContent = "لم يتم اختيار أي صورة لرفعها...";
            output.appendChild(para);
        } else {
            const list = document.createElement("ol");
            list.classList.add("flexy", "gap-x1");
            output.appendChild(list);

            for (const file of currentFiles) {
                const listItem = document.createElement("li");
                const para = document.createElement("p");
                if (validImageType(file)) {
                    para.textContent = `اسم الملف: ${file.name}، حجم الملف: ${returnFileSize(file.size)}.`;
                    const image = document.createElement("img");
                    image.src = URL.createObjectURL(file);

                    listItem.appendChild(image);
                    listItem.appendChild(para);
                } else {
                    para.textContent = `اسم الملف: ${file.name}: نوع هذا الملف غير مسموح به. يرجى تحديث الاختيار.`;
                    listItem.appendChild(para);
                }

                list.appendChild(listItem);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const imageTypes = [
    "image/apng",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    "image/x-icon"
];

const validImageType = (file) => {
    try {
        return imageTypes.includes(file.type);
    } catch (error) {
        console.error(error);
    }
};

// Takes a number in bytes, and turns it into a nicely formatted size in bytes/KB/MB.
const returnFileSize = (bytes) => {
    try {
        if (bytes < 1024) {
            return `${bytes} بايت`;
        } else if (bytes >= 1024 && bytes < 1048576) {
            return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
        } else if (bytes >= 1048576) {
            return `${(bytes / 1048576).toFixed(1)} ميغابايت`;
        }
    } catch (error) {
        console.error(error);
    }
};

export { updateImageDisplay, };