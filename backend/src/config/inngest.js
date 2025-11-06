import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/users.model.js";
import { upsertStreamUser,deleteStreamUser } from "./stream.js";

//creating a client to send and receive events
export const inngest = new Inngest({ id: "connectly" });

const addUser = inngest.createFunction(
  { id: "add_user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      image: image_url,
    };

    await User.create(newUser); //adding user to mongodb

    await upsertStreamUser({  //adding user to stream
      id: id.toString(),
      name: newUser.name,
      image: image_url,
    }); 

  }
)
const deleteUser = inngest.createFunction(
  { id: "delete_user" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkId: id }); //deleting user from mongodb
    await deleteStreamUser(id.toString()); //deleting user from stream
  }
);

// Create an empty array where we'll export future Inngest functions

export const functions = [addUser,deleteUser];