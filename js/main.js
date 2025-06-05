"use strict";
import form from "./form.js";
import skillbar from "./skillbar.js";

document.addEventListener("DOMContentLoaded", () => {
  AOS.init({
    once: true,
  });
  form();
  skillbar();

  const nav = document.querySelector("#nav");
  const navBtn = document.querySelector("#nav-btn");
  const navBtnImg = document.querySelector("#nav-btn-img");

  //Hamburger menu
  navBtn.onclick = () => {
    if (nav.classList.toggle("open")) {
      navBtnImg.src = "img/icons/close.svg";
    } else {
      navBtnImg.src = "img/icons/open.svg";
    }
  };

  window.addEventListener("scroll", function () {
    const header = document.querySelector("#header");
    const hero = document.querySelector("#home");
    const goToTop = document.querySelector("#goToTop");

    if (header && hero && goToTop) {
      let triggerHeight = hero.offsetHeight - 170;

      if (window.scrollY > triggerHeight) {
        header.classList.add("header-sticky");
        goToTop.classList.add("reveal");
      } else {
        header.classList.remove("header-sticky");
        goToTop.classList.remove("reveal");
      }
    }
  });

  // Improve section navigation with null checks
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("header nav a");

  window.onscroll = () => {
    sections.forEach((sec) => {
      if (!sec) return;

      let top = window.scrollY;
      let offset = sec.offsetTop - 170;
      let height = sec.offsetHeight;
      let id = sec.getAttribute("id");

      if (top >= offset && top < offset + height && id) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          const targetLink = document.querySelector(`header nav a[href*="${id}"]`);
          if (targetLink) {
            targetLink.classList.add("active");
          }
        });
      }
    });
  };
});
