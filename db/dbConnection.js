import mongoose from "mongoose";

export const dbConnection =async () => {
  await mongoose.connect(process.env.dp_URL_ONLINE).then(() => {
    console.log(`db connect in ${process.env.dp_URL_ONLINE}`)
  }).catch((err) => {
    console.log("db connect fail" , err);
    
  })
}