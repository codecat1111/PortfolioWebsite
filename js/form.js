const form = () => {
  const contactForm = document.querySelector(".contactForm");
  const responseMessage = document.querySelector(".response");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Show loading message
    responseMessage.classList.add("open");
    responseMessage.textContent = "Please wait...";

    // Get form data
    const formData = new FormData(contactForm);
    
    try {
      // Submit to Netlify
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (response.ok) {
        responseMessage.textContent = "Thank you for your message!";
        contactForm.reset(); // Clear form fields
        
        // Hide message after 3 seconds
        setTimeout(() => {
          responseMessage.classList.remove("open");
        }, 3000);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      responseMessage.textContent = "Sorry, there was an error sending your message. Please try again.";
      console.error("Error:", error);
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        responseMessage.classList.remove("open");
      }, 5000);
    }
  });
};

export default form;