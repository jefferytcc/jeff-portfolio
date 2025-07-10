import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";

document.querySelector("#app").innerHTML = `
  <header class="bg-gray-100 shadow-md">
    <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold">Jeff Tan</h1>
      <nav class="space-x-4">
        <a href="#projects" class="text-gray-700 hover:text-blue-600">Projects</a>
        <a href="#contact" class="text-gray-700 hover:text-blue-600">Contact</a>
      </nav>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-16">
    <section class="text-center">
      <h2 class="text-4xl font-bold mb-4">Hi, I'm Jeff 👋</h2>
      <p class="text-lg text-gray-600">I'm a designer turned frontend developer building cool stuff with Tailwind CSS.</p>
    </section>

    <section id="projects" class="mt-24">
      <h3 class="text-2xl font-bold mb-6">Projects</h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="p-4 border bg-white rounded-lg shadow hover:shadow-md transition">
          <h4 class="font-semibold text-lg">Project One</h4>
          <p class="text-sm text-blue-500">Short description of the project goes here.</p>
        </div>
        <div class="p-4 border bg-white rounded-lg shadow hover:shadow-md transition">
          <h4 class="font-semibold text-lg">Project Two</h4>
          <p class="text-sm text-gray-500">Another project description here.</p>
        </div>
      </div>
    </section>
  </main>


`;

setupCounter(document.querySelector("#counter"));
