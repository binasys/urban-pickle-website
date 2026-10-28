const query = new URLSearchParams(location.search);
document.body.dataset.brand = ["2", "3"].includes(query.get("brand")) ? query.get("brand") : "1";
document.body.dataset.compare = query.get("compare") === "1";
