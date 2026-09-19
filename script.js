// Campus Lost & Found
// JavaScript file


// Get HTML elements
const form = document.getElementById("reportForm");
const itemsContainer = document.getElementById("itemsContainer");
const message = document.getElementById("message");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");


// Load items from MySQL
displayItems();


// Submit form
form.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("itemType").value;
    const name = document.getElementById("itemName").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("itemDate").value;

    const photoInput = document.getElementById("itemPhoto");

    let photo = "";


    // Check if photo was selected
    if (photoInput.files.length > 0) {

        const file = photoInput.files[0];

        const reader = new FileReader();


        reader.onload = function () {

            photo = reader.result;

            saveItem(
                type,
                name,
                category,
                description,
                location,
                date,
                photo
            );

        };


        reader.readAsDataURL(file);

    } else {

        saveItem(
            type,
            name,
            category,
            description,
            location,
            date,
            photo
        );

    }

});


// Send item to Node.js
function saveItem(
    type,
    name,
    category,
    description,
    location,
    date,
    photo
) {

    fetch("/api/items", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            type: type,
            name: name,
            category: category,
            description: description,
            location: location,
            date: date,
            photo: photo

        })

    })

    .then(function (response) {

        return response.json();

    })

    .then(function (data) {

        message.textContent = data.message;

        form.reset();

        displayItems();

    })

    .catch(function (error) {

        console.log(error);

        message.textContent =
            "Error saving item.";

    });

}


// Get items from MySQL
function displayItems() {

    fetch("/api/items")

    .then(function (response) {

        return response.json();

    })

    .then(function (items) {


        // Search text
        const searchText =
            searchInput.value.toLowerCase();


        // Selected type
        const selectedType =
            filterType.value;


        // Selected category
        const selectedCategory =
            filterCategory.value;


        // Filter items
        items = items.filter(function (item) {


            const matchesSearch =

                item.item_name
                    .toLowerCase()
                    .includes(searchText)

                ||

                item.description
                    .toLowerCase()
                    .includes(searchText)

                ||

                item.location
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =

                selectedType === ""

                ||

                item.item_type === selectedType;


            const matchesCategory =

                selectedCategory === ""

                ||

                item.category === selectedCategory;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


        // Clear old items
        itemsContainer.innerHTML = "";


        // No results
        if (items.length === 0) {

            itemsContainer.innerHTML =
                "<p>No matching items found.</p>";

            return;

        }


        // Display items
        items.forEach(function (item) {

            const card =
                document.createElement("div");


            card.className =
                "item-card";


            card.innerHTML = `

                ${
                    item.photo
                    ? `<img
                        src="${item.photo}"
                        class="item-photo"
                      >`
                    : ""
                }

                <h3>
                    ${item.item_name}
                </h3>

                <p>
                    <strong>Type:</strong>
                    ${item.item_type}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${item.category}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${item.description}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${item.location}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${item.item_date}
                </p>

               <button
    onclick="deleteItem(${item.id})"
>
    Delete
</button>

<p>
    <strong>Status:</strong>
    ${item.status}
</p>

${
    item.status === "Active"
    ? `
        <button
            onclick="markRecovered(${item.id})"
        >
            Mark as Recovered
        </button>
      `
    : `
        <p><strong>✓ Item Recovered</strong></p>
      `
}

            `;


            itemsContainer.appendChild(card);

        });

    })

    .catch(function (error) {

        console.log(error);

    });

}


// Delete item from MySQL
function deleteItem(id) {

    fetch("/api/items/" + id, {

        method: "DELETE"

    })

    .then(function (response) {

        return response.json();

    })

    .then(function (data) {

        message.textContent =
            data.message;

        displayItems();

    })

    .catch(function (error) {

        console.log(error);

    });

}


// Search filter
searchInput.addEventListener(
    "input",
    displayItems
);


// Lost / Found filter
filterType.addEventListener(
    "change",
    displayItems
);


// Category filter
filterCategory.addEventListener(
    "change",
    displayItems
);
// Mark item as recovered
function markRecovered(id) {

    fetch("/api/items/" + id, {

        method: "PUT"

    })

    .then(function (response) {

        return response.json();

    })

    .then(function (data) {

        message.textContent =
            data.message;

        displayItems();

    })

    .catch(function (error) {

        console.log(error);

        message.textContent =
            "Error updating item.";

    });

}