import { brands, types } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
  const sortTypeSelect = document.getElementById("sort-type");
  const filterNameSelect = document.getElementById("filter-name");
  const filterTypeSelect = document.getElementById("filter-type");
  const filterBrandSelect = document.getElementById("filter-brand");
  const catalog = document.querySelector(".catalog");

  let filterName;
  let filterType;
  let filterBrand;

  sortTypeSelect.addEventListener("change", loadProducts);

  const filterChangeHandler = function (event) {
    const { id, value } = event.target;
    if (id === "filter-name") filterName = value;
    else if (id === "filter-type") filterType = value;
    else if (id === "filter-brand") filterBrand = value;
    loadProducts();
  };

  filterNameSelect.addEventListener("keyup", filterChangeHandler);
  filterTypeSelect.addEventListener("change", filterChangeHandler);
  filterBrandSelect.addEventListener("change", filterChangeHandler);

  let tabIndex = 1;
  let data;

  function fillFilter(selectElement, data) {
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  }

  function sortByParameter(products, parameter, comparator) {
    return products
      .slice()
      .sort((a, b) => comparator(a[parameter], b[parameter]));
  }

  const sortFunctions = {
    "Melhor Avaliados": (products) =>
      sortByParameter(products, "rating", (a, b) => b - a),
    "Menores Preços": (products) =>
      products
        .filter((product) => isValidPrice(product.price))
        .sort((a, b) => Number(a.price) - Number(b.price)),
    "Maiores Preços": (products) =>
      products
        .filter((product) => isValidPrice(product.price))
        .sort((a, b) => Number(b.price) - Number(a.price)),
    "A-Z": (products) =>
      sortByParameter(products, "name", (a, b) =>
        (a || "").toLowerCase().localeCompare((b || "").toLowerCase())
      ),
    "Z-A": (products) =>
      sortByParameter(products, "name", (a, b) =>
        (b || "").toLowerCase().localeCompare((a || "").toLowerCase())
      ),
  };
  function filterProducts(products, filterValue, filterProperty) {
    return products.slice().filter((product) => {
      if (filterProperty === "name") {
        return filterValue && filterValue.trim() !== ""
          ? product[filterProperty]
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          : true;
      } else {
        return product[filterProperty] === filterValue;
      }
    });
  }

  async function loadProducts() {
    const sortType = sortTypeSelect.value;
    let products;

    if (!data) {
      products = await getProducts();
    } else {
      products = data;
    }

    let filteredProducts = products;

    if (filterBrand && filterBrand !== "Todos") {
      filteredProducts = filterProducts(products, filterBrand, "brand");
    }

    if (filterType && filterType !== "Todos") {
      filteredProducts = filterProducts(
        filteredProducts ? filteredProducts : products,
        filterType,
        "product_type"
      );
    }

    if (filterName && filterName !== "") {
      filteredProducts = filterProducts(
        filteredProducts ? filteredProducts : products,
        filterName,
        "name"
      );
    }
    const sortedProducts = sortFunctions[sortType]
      ? sortFunctions[sortType](filteredProducts)
      : filteredProducts;

    catalog.textContent = "";
    if (sortedProducts.length > 0) {
      for (const product of sortedProducts) {
        productItem(product, catalog);
      }
    } else {
      catalog.innerHTML =
        "<h1> No Products Found with the current filter/sorting...</h1>";
    }
  }

  function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.classes) {
      options.classes.forEach((className) => element.classList.add(className));
    }
    if (options.attributes) {
      Object.keys(options.attributes).forEach((attr) =>
        element.setAttribute(attr, options.attributes[attr])
      );
    }
    if (options.text) {
      element.textContent = options.text;
    }
    if (options.children) {
      options.children.forEach((child) => element.appendChild(child));
    }
    return element;
  }

  function isValidPrice(price) {
    return (
      price !== null &&
      price !== "" &&
      price !== 0 &&
      price !== "R$ 0,00" &&
      price !== "0.00" &&
      price !== "0.0" &&
      price !== "0"
    );
  }

  function productItem(product, catalog) {
    if (isValidPrice(product.price)) {
      const fragment = document.createDocumentFragment();

      let convertedPrice = parseFloat(product.price * 5.5)
        .toFixed(2)
        .replace(".", ",");

      const item = createElement("div", {
        classes: ["product"],
        attributes: {
          "data-name": product.name,
          "data-brand": product.brand,
          "data-type": product.product_type,
          tabindex: tabIndex++,
        },
        children: [
          createElement("figure", {
            classes: ["product-figure"],
            children: [
              createElement("img", {
                attributes: {
                  src: product.image_link,
                  width: 215,
                  height: 215,
                  alt: product.name,
                  onerror: "this.onerror=null;this.src='img/unavailable.png';",
                },
              }),
            ],
          }),
          createElement("section", {
            classes: ["product-description"],
            children: [
              createElement("h1", {
                classes: ["product-name"],
                text: product.name,
              }),
              createElement("div", {
                classes: ["product-brands"],
                children: [
                  createElement("span", {
                    classes: ["product-brand", "background-brand"],
                    text: product.brand,
                  }),
                  createElement("span", {
                    classes: ["product-brand", "background-price"],
                    text: `R$ ${convertedPrice}`,
                  }),
                ],
              }),
            ],
          }),
        ],
      });
      item.addEventListener("click", function () {
        loadDetails(product, item);
      });
      fragment.appendChild(item);

      catalog.appendChild(fragment);
    }
  }

  function createElementWithProps(
    tag,
    { classes = [], text = "", children = [] }
  ) {
    const element = document.createElement(tag);
    classes.forEach((cls) => element.classList.add(cls));
    element.textContent = text;
    children.forEach((child) => element.appendChild(child));
    return element;
  }

  function loadDetails(product, item) {
    const EMPTY_VALUE = "R$ 0,00";
    const MAX_WIDTH = "250px";

    const detailsSection = createElementWithProps("section", {
      classes: ["product-details"],
    });

    const detailsRows = [
      { label: "Brand", value: product.brand },
      {
        label: "Price",
        value: `R$ ${product.price}`,
      },
      { label: "Rating", value: product.rating },
      { label: "Category", value: product.category },
      { label: "Product_type", value: product.product_type },
    ];

    detailsRows.forEach((row) => {
      if (row.value && row.value !== EMPTY_VALUE) {
        const rowDiv = createElementWithProps("div", {
          classes: ["details-row"],
        });
        const labelDiv = createElementWithProps("div", { text: row.label });
        const barDiv = createElementWithProps("div", {
          classes: ["details-bar"],
        });
        const barBgDiv = createElementWithProps("div", {
          classes: ["details-bar-bg"],
          text: row.value,
        });
        barBgDiv.style.maxWidth = MAX_WIDTH;

        barDiv.appendChild(barBgDiv);
        rowDiv.appendChild(labelDiv);
        rowDiv.appendChild(barDiv);
        detailsSection.appendChild(rowDiv);
      }
    });

    item.appendChild(detailsSection);

    item.appendChild(detailsSection);
  }

  async function getProducts() {
    try {
      const response = await fetch(
        "https://makeup-api.herokuapp.com/api/v1/products.json"
      );
      if (!data) {
        data = await response.json();
      }
      const extractedData = data.map((item) => ({
        name: item.name,
        brand: item.brand,
        price: item.price,
        rating: item.rating,
        category: item.category,
        product_type: item.product_type,
        image_link: item.image_link,
      }));
      return extractedData;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }

  fillFilter(filterTypeSelect, types);
  fillFilter(filterBrandSelect, brands);
  loadProducts();
});
