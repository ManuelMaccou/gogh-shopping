const express = require('express');
const router = express.Router();
const client = require('./elasticsearch-client');
const GenerateBookImage = require('../utils/bookImageGenerator');

router.post('/books', async (req, res) => {
    const { inputText, buttonIndex } = req.body.untrustedData;
    console.log("Input text for search:", inputText);

    let index = parseInt(req.query.index) || 0;
    let initial = req.query.initial === 'true';
    let query = req.query.query || inputText;

    if (!query) {
        const htmlContent = getResetHTML(true);
        return res.send(htmlContent);
      }

    if (buttonIndex === 3) {
        return res.send(getResetHTML());
      }

    if (initial) {
        index = 0;
    } else {
  
        if (buttonIndex === 1) {
            index = index === 9 ? 0 : index + 1;
        } else if (buttonIndex === 2) {
            index = index === 0 ? 9 : index - 1;
        } 
    }

  try {
    const response = await client.searchTemplate({
      index: 'search-gogh-books',
      body: {
        id: 'gogh-books-search-template',
        params: {
            knn_query: query,
            text_query: query,
            k: 10,
            num_candidates: 100,
            rrf_window_size: 50,
            rrf_rank_constant: 20
        }
      }
    });


    console.log("Full Elasticsearch response:", response);
    
    if (response && response && response.hits && response.hits.hits.length > index) {

        const selectedResult = response.hits.hits[index];

        const productData = {
            imageUrl: selectedResult._source.image,
            description: selectedResult._source.short_description,
          };

          const generatedImageUrl = await GenerateBookImage(productData);
  
        const results = {
          id: selectedResult._id,
          title: selectedResult._source.title,
          description: selectedResult._source.short_description,
          image: generatedImageUrl,
          author: selectedResult._source.creator,
          checkoutUrl: selectedResult._source.checkout_url,
          productUrl: selectedResult._source.product_url,
        };
  
            // Generate HTML content based on the selected result
            const htmlContent = generateHTMLResponse(results, index, query);
            console.log("htmlContent:", htmlContent)
    
            res.status(200).send(htmlContent);
        } else {
            console.error('No hits or response is undefined');
            res.status(404).json({ success: false, message: "No results found or query failed." });
        }
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      res.status(500).send('Internal Server Error');
    }
});

  
function getResetHTML(useAlternateImage = false) {
    const defaultImage = "https://aef8cbb778975f3e4df2041ad0bae1ca.cdn.bubble.io/f1707933712452x423761188033314940/book_frame_background.jpg";
    const alternateImage = "https://aef8cbb778975f3e4df2041ad0bae1ca.cdn.bubble.io/f1707933861285x954893258473037400/try_again_book_search.jpg";
    const imageToUse = useAlternateImage ? alternateImage : defaultImage;

    return `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Gogh Books</title>
            <meta name="description" content="A collection of books in the Gogh Mall" />
            <meta property="og:url" content="https://www.gogh.shopping" />
            <meta property="og:image" content="${imageToUse}" />
            <meta property="fc:frame" content="vNext" />
            <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/search/books?initial=true" />
            <meta property="fc:frame:image" content="${imageToUse}" />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:button:1" content="Search" />
            <meta property="fc:frame:input:text" content="Search books" />
            <meta property="fc:frame:button:2" content="Browse all" />
        </head>
    </html>
    `;
}

function generateHTMLResponse(results, index, query) {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Gogh Books</title>
            <meta name="description" content="A collection of books in the Gogh Mall" />
            <meta property="og:url" content="${results.productUrl}" />
            <meta property="fc:frame" content="vNext" />
            <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/search/books?index=${index}&query=${query}" />
            <meta property="fc:frame:image" content="${results.image}" />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:button:1" content="prev" />
            <meta property="fc:frame:button:2" content="next" />
            <meta property="fc:frame:button:3" content="go back" />
            <meta property="fc:frame:button:4" content="buy" />
            <meta property="fc:frame:button:4:action" content="link" />
            <meta property="fc:frame:button:4:target" content="${results.productUrl}" />
        </head>
    </html>
    `;
    return htmlContent;
}

module.exports = router;
