(function (global) {
    "use strict";

    const customersKey = "customers";
    const currentKey = "currentCustomerId";

    function customers() { return NdagoStorage.read(customersKey, []); }
    function setCustomers(value) { NdagoStorage.write(customersKey, value); }
    function current() {
        const id = NdagoStorage.read(currentKey, "");
        const customer = customers().find(function (record) { return record.id === id; }) || null;
        if (customer && customer.accountStatus === "disabled") { NdagoStorage.remove(currentKey); return null; }
        return customer;
    }
    function save(customer) {
        const records = customers();
        const index = records.findIndex(function (record) { return record.id === customer.id; });
        if (index < 0) records.push(customer); else records[index] = customer;
        setCustomers(records);
    }
    function notify(form, message, type) {
        let alert = form.querySelector("[data-form-message]");
        if (!alert) {
            alert = document.createElement("div");
            alert.dataset.formMessage = "";
            alert.setAttribute("role", "status");
            form.prepend(alert);
        }
        alert.className = "alert alert-" + type;
        alert.textContent = message;
    }
    function id() { return "customer-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    function bindRegistration() {
        const form = document.querySelector("[data-customer-register]");
        if (!form) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const passwords = form.querySelectorAll('input[type="password"]');
            if (passwords.length > 1 && passwords[0].value !== passwords[1].value) {
                notify(form, "The password confirmation does not match.", "warning");
                return;
            }
            const values = new FormData(form);
            const email = String(values.get("email") || "").trim().toLowerCase();
            const phone = String(values.get("phone") || "").trim();
            if (customers().some(function (customer) {
                return customer.email.toLowerCase() === email || customer.phone === phone;
            })) {
                notify(form, "An account with this email or phone already exists. Please log in.", "warning");
                return;
            }
            const customer = {
                id: id(), name: (String(values.get("firstName")).trim() + " " + String(values.get("lastName")).trim()).trim(),
                email: email, phone: phone, district: String(values.get("district") || ""), addresses: [], createdAt: new Date().toISOString()
            };
            save(customer);
            NdagoStorage.write(currentKey, customer.id);
            const requested = new URLSearchParams(window.location.search).get("next") || "";
            const next = /^(?:seller\/)?[a-z0-9_-]+\.html(?:\?[a-z0-9%&=_-]*)?$/i.test(requested) ? requested : "account.html";
            window.location.href = next;
        });
    }

    function bindLogin() {
        const form = document.querySelector("[data-customer-login]");
        if (!form) return;
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const identity = String(new FormData(form).get("identity") || "").trim().toLowerCase();
            const customer = customers().find(function (record) {
                return record.email.toLowerCase() === identity || record.phone.toLowerCase() === identity;
            });
            if (!customer) {
                notify(form, "No demonstration account matches that email or phone. Create a buyer account first.", "warning");
                return;
            }
            if (customer.accountStatus === "disabled") {
                notify(form, "This demonstration account is disabled. Contact the marketplace administrator.", "danger");
                return;
            }
            NdagoStorage.write(currentKey, customer.id);
            const requested = new URLSearchParams(window.location.search).get("next") || "";
            const next = /^(?:seller\/)?[a-z0-9_-]+\.html(?:\?[a-z0-9%&=_-]*)?$/i.test(requested) ? requested : "account.html";
            window.location.href = next;
        });
    }

    global.NdagoAuth = {
        current: current,
        save: save,
        logout: function () { NdagoStorage.remove(currentKey); window.location.href = "index.html"; },
        bind: function () { bindRegistration(); bindLogin(); }
    };
    document.addEventListener("DOMContentLoaded", global.NdagoAuth.bind);
})(window);
