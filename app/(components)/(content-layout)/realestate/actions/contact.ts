import { ContactProps } from "../components/contacts-table";

export async function getAllContacts() {
  
  
  const url = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const response = await fetch(`${url}/api/schoolmanage/contacts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },

    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contacts = await response.json();
    console.log(contacts);

    return contacts as ContactProps[];
  } catch (error) {
    console.log(error);
  }
}