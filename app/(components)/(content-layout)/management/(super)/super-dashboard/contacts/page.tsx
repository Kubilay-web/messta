import { getAllContacts } from "../../../actions/contact"
import ContactsTable from "../../../components/contacts-table"

export default async function Page() {
    const contacts = await getAllContacts()

    
  return <ContactsTable contacts={contacts}/>
}
