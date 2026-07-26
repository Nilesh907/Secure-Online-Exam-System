
document.addEventListener("DOMContentLoaded", function () {

    /* ================= BASIC SETUP ================= */

    const paperId = window.location.pathname.split("/")[2];

    
    const endTime = new Date(
        document.getElementById("examData")
            .dataset.endtime
    ).getTime();

    console.log("END TIME:", endTime);

    const form = document.getElementById("examForm");

    const timerElement =
        document.getElementById("timer");

    let isSubmitting = false;

    let examSubmitted = false;

    
    let tabSwitchCount = 0

    const MAX_SWITCH = 5;


    /* ================= LOGOUT FUNCTION ================= */

    function logoutUser() {

        localStorage.removeItem(
        "tabSwitchCount"
    );
        const logoutForm =
        document.createElement("form");

        logoutForm.method = "POST";

        logoutForm.action = "/auth/logout";

        document.body.appendChild(logoutForm);

        logoutForm.submit();
    }


    /* ================= TIMER ================= */

    function updateTimer() {

        const now = Date.now();

        const diff = endTime - now;

        if (diff <= 0) {

            timerElement.innerText =
                "Time Over";

            if (!examSubmitted) {

                examSubmitted = true;

                alert(
                    "Time is over. Submitting exam."
                );

                form.submit();
            }

            return;
        }

        const min = Math.floor(
            diff / 60000
        );

        const sec = Math.floor(
            (diff % 60000) / 1000
        );

        timerElement.innerText =
            `${min}:${sec < 10 ? '0' + sec : sec}`;
    }

    updateTimer();

    setInterval(updateTimer, 1000);


    /* ================= AUTO SUBMIT ================= */

    setTimeout(() => {

        if (!examSubmitted) {

            examSubmitted = true;

            alert(
                "Exam time finished. Auto submitting."
            );

            localStorage.removeItem("tabSwitchCount");

            form.submit();
        }

    }, endTime - Date.now());


    /* ================= RIGHT CLICK BLOCK ================= */

   document.addEventListener("contextmenu", function (e) {

    if (examSubmitted) return;

    e.preventDefault();

    fetch(`/exam/violation/${paperId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "RIGHT_CLICK"
        })
    }).catch(console.error);

    alert("Right click is not allowed during the exam.");

});

    /* ================= SHORTCUT BLOCK ================= */

    document.addEventListener("keydown", function (e) {

    console.log("KEY:", e.key);

    if (e.key === "F12") {

    fetch(
        `/exam/violation/${paperId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "DEVTOOLS"
            })
        }
    ).catch(console.error);

    alert("Developer Tools detected");

    e.preventDefault();

    return false;
}

    if (
        e.ctrlKey &&
        e.shiftKey &&
        ["I", "J", "C"].includes(e.key.toUpperCase())
    ) {
        alert("Developer shortcut blocked");
        e.preventDefault();
        return false;
    }

    if (
        e.ctrlKey &&
        ["U", "S", "P"].includes(e.key.toUpperCase())
    ) {
        alert("Shortcut blocked");
        e.preventDefault();
        return false;
    }
});

    /* ================= FULLSCREEN ================= */

    if (
        document.documentElement
            .requestFullscreen
    ) {

        document.documentElement
            .requestFullscreen()
            .catch(() => {});
    }

    document.addEventListener(
        "fullscreenchange",
        async function () {

            if (
                !document.fullscreenElement &&
                !examSubmitted
            ) {

                fetch(
    `/exam/violation/${paperId}`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "FULLSCREEN_EXIT"
        })
    }
).catch(console.error);

                alert(
                    "Fullscreen exited. Exam submitted automatically."
                );

                examSubmitted = true;

                try {

                    await fetch(
                        `/exam/${paperId}/submit`,
                        {
                            method: "POST"
                        }
                    );

                } catch (err) {

                    console.error(err);
                }

                logoutUser();
            }
        }
    );


    /* ================= TAB SWITCH DETECTION ================= */

    document.addEventListener(
        "visibilitychange",
        async function () {

            if (
                document.hidden &&
                !examSubmitted
            ) {

                tabSwitchCount++;
                fetch(
    `/exam/violation/${paperId}`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "TAB_SWITCH"
        })
    }
).catch(console.error);

                localStorage.setItem(
                    "tabSwitchCount",
                    tabSwitchCount
                );

                if (
                    tabSwitchCount <
                    MAX_SWITCH
                ) {

                    alert(
                        `Warning: Tab switch detected (${tabSwitchCount}/${MAX_SWITCH})`
                    );

                } else {

                    alert(
                        "Maximum tab switch limit reached. Exam submitted permanently."
                    );

                    examSubmitted = true;

                    try {

                        await fetch(
                            `/exam/${paperId}/submit`,
                            {
                                method: "POST"
                            }
                        );

                    } catch (err) {

                        console.error(
                            "Submission failed:",
                            err
                        );
                    }

                    logoutUser();
                }
            }
        }
    );


    /* ================= FORM SUBMIT ================= */

    if (form) {

        form.addEventListener(
            "submit",
            function () {

                isSubmitting = true;

                examSubmitted = true;
            }
        );
    }


    /* ================= PAGE CLOSE DETECTION ================= */

    window.addEventListener(
        "beforeunload",
        function () {

            if (
                !isSubmitting &&
                !examSubmitted
            ) {

                navigator.sendBeacon(
                    `/exam/${paperId}/submit`
                );
            }
        }
    );

});

