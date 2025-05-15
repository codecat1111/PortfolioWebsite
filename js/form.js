const form = () => {
  const contactForm = document.querySelector(".contactForm");
  const responseMessage = document.querySelector(".response");

  contactForm.addEventListener("submit", (e) => {
    responseMessage.classList.add("open");
    responseMessage.textContent = "Please wait...";

    // Let the form submit normally — Netlify will handle it

    setTimeout(() => {
      responseMessage.textContent = "Thank you for your message!";
      contactForm.reset(); // Clear form fields
      responseMessage.classList.remove("open");
    }, 3000);
  });
};

export default form;
