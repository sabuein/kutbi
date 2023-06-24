"use strict";

import { getAllAuthors } from "./data.mjs";

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
        throw Error(`We got a problem at updateImageDisplay() function. Please help!`);
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
        throw Error(`We got a problem at validImageType() function. Please help!`);
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
        throw Error(`We got a problem at returnFileSize() function. Please help!`);
    }
};

let sample = [
    {
        "author_id": 1,
        "fname": "صلاح الدين",
        "lname": "أبو عين",
        "dob": "1987-01-18T00:00:00.000Z",
        "lang": "ar",
        "tel": "+447930120661",
        "country": "gb",
        "email": "sabuein@gmail.com",
        "github": "https://github.com/sabuein",
        "twitter": "https://twitter.com/sabuein",
        "facebook": "https://www.facebook.com/sabuein/",
        "instagram": "https://www.instagram.com/sabuein/",
        "youtube": "https://www.youtube.com/@sabuein/",
        "website": "https://sabuein.github.io/",
        "bio": "إنسان، وأب، وزوج، ومبدع إلكتروني، ومطوّر ويب.",
        "photo": "../api/uploads/78ac610f15cae3e941d53c8b7ca8e9a3",
        "created_at": "2023-05-30T22:41:35.000Z",
        "edited_at": "0000-00-00 00:00:00",
        "deleted_at": "0000-00-00 00:00:00"
    }
];

const updateAuthorDisplay = async (output) => {
    try {
        // const authorsArray = [];
        const authors = await getAllAuthors();
        // for (let author in authors) authorsArray.push(authors[author]);
        
        // console.log(authors);
        // console.log(authorsArray);

        authors.reverse().forEach((author, index) => {
            const article = document.createElement("article"),
                authorId = document.createElement("span"),
                figure = document.createElement("figure"),
                figcaption = document.createElement("figcaption"),
                img = document.createElement("img"),
                p = document.createElement("p"),
                div = document.createElement("div"),
                email = document.createElement("a"),
                github = document.createElement("a"),
                twitter = document.createElement("a"),
                facebook = document.createElement("a"),
                instagram = document.createElement("a"),
                youtube = document.createElement("a"),
                website = document.createElement("a");
            
            // Setting up the elements
            authorId.textContent = author.id;
            authorId.style.display = "none";
            figcaption.textContent = `${author.fname} ${author.lname}`;
            img.title = `${author.fname} ${author.lname}`;
            img.alt = `الصورة الشخصية`;
            img.src = author.photoUrl;
            p.textContent = author.bio;
            email.href = `mailto:${author.email}`;
            email.target = "_blank";
            email.textContent = "E";
            website.href = author.website;
            website.target = "_blank";
            website.textContent = "W";

            // Inserting to the DOM
            div.appendChild(email);
            div.appendChild(website);
            div.classList.add("flexy", "row", "gap-x1");
            figure.appendChild(img);
            figure.appendChild(figcaption);
            article.appendChild(authorId);
            article.appendChild(figure);
            article.appendChild(div);
            article.appendChild(p);
            article.classList.add("author-card", "flexy");
            article.dataset.index = index;
            article.dataset.authorId = author.id;
            output.appendChild(article);
        });
    } catch (error) {
        console.error(error);
        throw Error(`We got a problem at updateAuthorDisplay() function. Please help!`);
    }
};

/*const updateButton = (e, paragraph) => {
    (e.target.value === "Start machine")
    ? (e.target.value = "Stop machine") && (paragraph.textContent = "The machine has started!")
    : (e.target.value = "Start machine") && (paragraph.textContent = "The machine is stopped.");
};*/

export { updateImageDisplay, updateAuthorDisplay };