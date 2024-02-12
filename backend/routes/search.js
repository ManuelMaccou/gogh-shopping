const express = require('express');
const router = express.Router();
const client = require('./elasticsearch-client');

router.post('/books', async (req, res) => {
  const { inputText, buttonIndex } = req.body.untrustedData;
  console.log("Input text for search:", inputText);

  let index = parseInt(req.query.index) || 0;
  let initial = req.query.initial === 'true'

  if (initial) {
    index = 0;
  } else {
  
    if (buttonIndex === 3) {
        index = index === 9 ? 0 : index + 1;
    } else if (buttonIndex === 1) {
        index = index === 0 ? 9 : index - 1;
    }
}

  try {
    const response = await client.searchTemplate({
      index: 'search-gogh-books',
      body: {
        id: 'gogh-books-search-template',
        params: {
            knn_query: inputText,
            text_query: inputText,
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
  
        const results = {
          id: selectedResult._id,
          title: selectedResult._source.title,
          description: selectedResult._source.short_description,
          image: selectedResult._source.image,
          author: selectedResult._source.creator,
          checkoutUrl: selectedResult._source.checkout_url,
          productUrl: selectedResult._source.product_url,
        };
  
        // Generate HTML content based on the selected result
        const htmlContent = generateHTMLResponse(results, index);
  
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


function generateHTMLResponse(results, index) {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Gogh Books</title>
            <meta name="description" content="A collection of books in the Gogh Mall" />
            <meta property="og:url" content="${results.productUrl}" />
            <meta property="og:image" content="${results.image}" />
            <meta property="fc:frame" content="vNext" />
            <meta name="fc:frame:post_url" content="${process.env.BASE_URL}/api/search/books?index=${index}" />
            <meta property="fc:frame:image" content="${results.image}" />
            <meta property="fc:frame:image:aspect_ratio" content="" />
            <meta property="fc:frame:button:1" content="back" />
            <meta property="fc:frame:button:2" content="next" />
            <meta property="fc:frame:button:3" content="buy" />
            <meta property="fc:frame:button:3:action" content="link" />
            <meta property="fc:frame:button:3:target" content="${results.productUrl}" />
        </head>
    </html>
    `;
    return htmlContent;
}

module.exports = router;
