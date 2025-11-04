import { connect } from "mongoose";

async function connectMongoDb(url) {
  return connect(url);
}
export default connectMongoDb ;