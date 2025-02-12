import React, { useState } from "react";
import "./App.css";
import { getRecommendations } from "./apiService";
import Spinner from "./components/Spinner";

const App = () => {
  const [influencerId, setInfluencerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextProduct, setNextProduct] = useState(null);
  const [nextScore, setNextScore] = useState(null);

  const fetchProducts = async (nextProduct=null, nextScore=null , set = 50) => {
    setError("");
    setLoading(true);
    try {
      const params = { nextProduct, nextScore, set };
      const { data } = await getRecommendations(influencerId, params);
      if(!influencerId){
        setError("Veuillez entrez un uid.");
      }
      if (data && data.products.length > 0) {
        setProducts(prevProducts => [...prevProducts, ...data.products]);
        setNextProduct(data.nextProduct);
        setNextScore(data.nextScore);
      } else {
        setProducts([]);
        setError("Aucun produit suggéré trouvé.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
        setError("Erreur lors de la récupération des produits.");
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MODÈLE AI DE SUGGESTION DES PRODUITS</h1>
        <div className="input-section">
          <input
            type="text"
            placeholder="Id de l'influenceur"
            className="input-section"
            value={influencerId}
            onChange={(e) => setInfluencerId(e.target.value)}
          />
          <button className="button" onClick={() => fetchProducts()}>Voir résultats</button>
        </div>
      </header>
      <div className="results-section">
        <h2>TOP PRODUITS SUGGÉRÉS</h2>
        {loading && <Spinner />}
        {error && <p className="error-message">{error}</p>}
        <div className="product-cards">
        {products.length > 0 && products.map((product, index) => (
            <div key={index} className="product-card">
              {/* <span className="product-rank">#{index + 1}</span> */}
              <img className="product-image" src={product.image_url} alt={product.product_name}/>
              <h3>{product.product_name}</h3>
              <p>Brand: {product.display_name}</p> {/* Adjust based on actual data structure */}
              <p>Score Final: {product.score_final.toFixed(4)}</p>
              <p>Conversion Rate: {product.conversion_rate.toFixed(4)}</p>
              <p>{product.sub_categ.subcategory_name}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le produit              </a>
            </div>
          ))}
        </div>
        {products.length > 0 && (
          <>
            <button className="button" onClick={() => fetchProducts(nextProduct, nextScore)}>
              Charger plus
            </button>
            {loading && <Spinner />}
        </>
        )}
      </div>
    </div>
  );
};

export default App;
