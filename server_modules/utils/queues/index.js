import Queue from "bull";

// Імпорт функцій для роботи з чергами
import { addSingleTest } from "./singleTest.js";
import { addBatchTest } from "./batchTest.js";

// Експорт функцій
export { addSingleTest, addBatchTest };