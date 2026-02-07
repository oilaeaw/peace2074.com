import { createPinia } from "pinia";
import { createUStorePiniaPlugin } from "./ustore-plugin";

const pinia = createPinia();

// Register uStore persistence plugin
pinia.use(createUStorePiniaPlugin());

export default pinia;
