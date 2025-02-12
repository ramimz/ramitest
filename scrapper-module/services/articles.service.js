const {
    addArticle
} = require("../repositories/articles.repository");

const createArticle = async (data) => {
    try {
      const articlesArray = Object.values(data);
      let access = false;
      for(const article of articlesArray){
        if(article.id === '-M8p_h2GchxNaem7k_hy') access = true
        if(access === true){
          const result = await addArticle(article);
          console.log('Article added successfully', result)
        }
      }
      
      return 'All articles added successfully';
    } catch (error) {
      console.error("Error adding a new article :", error.message);
      // throw error;
    }
};

module.exports = {
    createArticle
}