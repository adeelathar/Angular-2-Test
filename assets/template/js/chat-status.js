/*
$(function(){
    var el, items = document.getElementsByClassName("chat-status");
    if (!items.length) return;
    for (var i = 0, l = items.length; i < l; i++) {
        el = items.item(i);
        setChatStatus(el, el.dataset);
    }
});
*/

function setChatStatus(el, values)
{
    if (!el) return;

    var now = new Date();

    if (now.getTime() / 1000 - values.ts > 60 * 15) {
        values.status = 0;
    }

    switch (parseInt(values.status)) {
        case 2:
            statusClass = "busy";
            statusText = "Busy";
            break;
        case 1:
            statusClass = "online";
            statusText = "Available";
            break;
        case 0:
        default:
            statusClass = "offline";
            statusText = "Offline";
    }

    var statusIcon = document.createElement("i");
    statusIcon.classList.add("fa", "fa-circle");

    var status = document.createElement("div");
    status.classList.add("status", statusClass);
    status.appendChild(statusIcon);
    status.appendChild(document.createTextNode(statusText));

    el.innerHMTL = "";
    el.appendChild(status);

    if (!values.ts || (now.getTime() / 1000 - values.ts < 60 * 15)) return;

    var seen = new Date(values.ts * 1000),
        seenDay = "" + seen.getFullYear() + seen.getMonth() + seen.getDay(),
        seenText = "Last seen ",
        today = "" + now.getFullYear() + now.getMonth() + now.getDay();

    now.setDate(now.getDate() - 1);
    var yesterday = "" + now.getFullYear() + now.getMonth() + now.getDay();

    if (seenDay === today) {
        seenText += "today at " + ("0" + seen.getHours()).slice(-2) + ":" + ("0" + seen.getMinutes()).slice(-2);
    } else if (seenDay === yesterday) {
        seenText += "yesterday at " + ("0" + seen.getHours()).slice(-2) + ":" + ("0" + seen.getMinutes()).slice(-2);
    } else {
        seenText += seen.toDateString() + " " + seen.toTimeString().split(" ")[0].split(":").slice(0,2).join(":");
    }

    var tsIcon = document.createElement("i");
    tsIcon.classList.add("fa", "fa-clock-o");

    var seenEl = document.createElement("p");
    seenEl.classList.add("time");
    seenEl.appendChild(tsIcon.cloneNode());
    seenEl.appendChild(document.createTextNode(seenText));

    el.appendChild(seenEl);
}