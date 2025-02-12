const {
    addClick,
    deleteClick,
} = require("../repositories/click.repository.js");

const createClick = async (data) => {
    try {
        const click = await addClick(data);
        return click;
    } catch (error) {
      console.error("Error creating a new click :", error.message);
      throw error;
    }
};

const removeClick = async (data) => {
    try {
      const { clickKey } = data;
      const result = await deleteClick(clickKey);
      return result;
    } catch (error) {
      console.error("Error deleting a click :", error.message);
      throw error;
    }
};

module.exports = {
    createClick,
    removeClick,
}