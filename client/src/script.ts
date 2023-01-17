import bot from "../assets/bot.svg";
import user from "../assets/user.svg";

const form: HTMLFormElement | null = document.querySelector("form");
const chatContainer: HTMLFormElement | null =
  document.querySelector("#chat_container");

let loadInterval: number;

const loader = (element: HTMLElement) => {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") element.textContent = "";
  }, 300);
};

const typeText = (element: HTMLElement, text: String) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index === text.length) {
      return clearInterval(interval);
    }
    element.innerHTML += text.charAt(index);
    index++;
  }, 20);
};

const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
};

const chatStripe = (
  isAi: Boolean,
  value: FormDataEntryValue | null,
  uniqueId: string
) => {
  return `
			<div class="wrapper ${isAi && "ai"} " >
				<div class="chat" >
					<div class="profile" >
					<img 
					src="${isAi ? bot : user}"
					alt="${isAi ? "bot" : "user"}"
					/>
					</div>
					<div class="message" id=${uniqueId}> ${value} </div>
				</div>
			</div>
		`;
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  const data = new FormData(form);

  if (chatContainer)
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"), "");

  form?.reset();

  const uniqueId = generateUniqueId();

  if (chatContainer) chatContainer.innerHTML += chatStripe(true, "", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (!response.ok) {
    const error = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(error);
  }

  const responseData = await response.json();
  const parsedData = responseData.bot.trim();

  typeText(messageDiv, parsedData);
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSubmit(event);
  }
});
