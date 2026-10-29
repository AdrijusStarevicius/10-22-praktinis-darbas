let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let editingId = null;

// Duomenų išsaugojimas

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Pranešimai

function showMessage(message, success = false) {
    const element = document.getElementById("message");
    element.textContent = message;
    element.style.color = success ? "green" : "red";
}

// Formos išvalymas

function clearForm() {
    document.getElementById("productForm").reset();
    editingId = null;

    document.getElementById("saveButton").textContent =
        "Pridėti prekę";
}

document.getElementById("cancelButton").addEventListener("click", function () {
    clearForm();
    showMessage("Redagavimas atšauktas.", true);
});

// Prekės pridėjimas ir redagavimas

document.getElementById("productForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("productId").value.trim();
    const name = document.getElementById("productName").value.trim();
    const quantityText = document.getElementById("productQuantity").value.trim();
    const quantity = Number(quantityText);

    // Tikriname laukus

    if (
        id === "" ||
        name === "" ||
        quantityText === "" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        showMessage("Užpildykite visus laukus. Kiekis turi būti teigiamas sveikasis skaičius.");
        return;
    }

    // Tikriname, ar ID jau egzistuoja

    const existingProduct = products.find(product => product.id === id);

    if (editingId === null && existingProduct) {
        showMessage("Prekė tokiu kodu jau egzistuoja!");
        return;
    }

    // Naujos prekės pridėjimas

    if (editingId === null) {
        products.push({
            id: id,
            name: name,
            quantity: String(quantity)
        });

        showMessage("Prekė sėkmingai pridėta!", true);
    } else {
        // Esamos prekės redagavimas

        const product = products.find(item => item.id === editingId);

        if (!product) {
            showMessage("Prekė nerasta.");
            clearForm();
            return;
        }

        if (id !== editingId && existingProduct) {
            showMessage("Kitas produktas jau turi šį kodą!");
            return;
        }

        const oldId = product.id;

        product.id = id;
        product.name = name;
        product.quantity = String(quantity);

        // Atnaujiname krepšelio informaciją

        cart.forEach(item => {
            if (item.id === oldId) {
                item.id = id;
                item.name = name;
            }
        });

        saveCart();

        showMessage("Prekė atnaujinta!", true);
    }

    saveProducts();
    clearForm();
    renderProducts();
    renderCart();
});

// Prekių rodymas lentelėje

function renderProducts() {
    const table = document.getElementById("productTable");
    const search = document.getElementById("searchInput").value.trim().toLowerCase();

    table.innerHTML = "";

    const filteredProducts = products.filter(product =>
        product.id.toLowerCase().includes(search) ||
        product.name.toLowerCase().includes(search)
    );

    filteredProducts.forEach(product => {
        const row = document.createElement("tr");

        [product.id, product.name, product.quantity].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        // Redagavimo mygtukas

        const editButton = document.createElement("button");
        editButton.textContent = "Redaguoti";
        editButton.type = "button";

        editButton.addEventListener("click", function () {
            document.getElementById("productId").value = product.id;
            document.getElementById("productName").value = product.name;
            document.getElementById("productQuantity").value = product.quantity;

            editingId = product.id;

            document.getElementById("saveButton").textContent =
                "Išsaugoti pakeitimus";

            showMessage("Redaguojate prekę: " + product.name, true);
        });

        // Trinimo mygtukas

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Ištrinti";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            if (!confirm("Ar tikrai norite ištrinti prekę " + product.name + "?")) {
                return;
            }

            products = products.filter(item => item.id !== product.id);
            cart = cart.filter(item => item.id !== product.id);

            if (editingId === product.id) {
                clearForm();
            }

            saveProducts();
            saveCart();

            renderProducts();
            renderCart();

            showMessage("Prekė ištrinta.", true);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        row.appendChild(actions);
        table.appendChild(row);
    });
}

// Paieška

document.getElementById("searchInput").addEventListener("input", renderProducts);

// Prekės įdėjimas į krepšelį

document.getElementById("cartForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("cartProductId").value.trim();
    const quantityText = document.getElementById("cartQuantity").value.trim();
    const quantity = Number(quantityText);

    const message = document.getElementById("cartMessage");

    if (
        id === "" ||
        quantityText === "" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        message.textContent = "Įveskite produkto kodą ir teigiamą sveikąjį kiekį.";
        message.style.color = "red";
        return;
    }

    const product = products.find(item => item.id === id);

    if (!product) {
        message.textContent = "Tokios prekės sandėlyje nėra.";
        message.style.color = "red";
        return;
    }

    const cartItem = cart.find(item => item.id === id);

    const alreadyInCart = cartItem ? Number(cartItem.quantity) : 0;

    if (alreadyInCart + quantity > Number(product.quantity)) {
        message.textContent = "Nepakanka prekių sandėlyje!";
        message.style.color = "red";
        return;
    }

    if (cartItem) {
        cartItem.quantity = String(alreadyInCart + quantity);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            quantity: String(quantity)
        });
    }

    saveCart();
    renderCart();

    document.getElementById("cartForm").reset();
    document.getElementById("cartQuantity").value = "1";

    message.textContent = "Prekė įdėta į krepšelį!";
    message.style.color = "green";
});

// Krepšelio rodymas

function renderCart() {
    const table = document.getElementById("cartTable");
    table.innerHTML = "";

    cart.forEach(item => {
        const row = document.createElement("tr");

        [item.id, item.name, item.quantity].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Pašalinti";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            cart = cart.filter(product => product.id !== item.id);

            saveCart();
            renderCart();

            const message = document.getElementById("cartMessage");
            message.textContent = "Prekė pašalinta iš krepšelio.";
            message.style.color = "green";
        });

        actions.appendChild(deleteButton);
        row.appendChild(actions);
        table.appendChild(row);
    });
}

// Pradinis atvaizdavimas

renderProducts();
renderCart();