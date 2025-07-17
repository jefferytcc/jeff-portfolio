import "./style.css";

const signature = document.getElementById("signature");

if (signature) {
  setTimeout(() => {
    signature.classList.remove("opacity-0", "translate-y-8");
    signature.classList.add(
      "opacity-100",
      "translate-y-0",
      "transition-all",
      "duration-1000"
    );
  }, 300);
}
