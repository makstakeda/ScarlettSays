export const dataSearch = {
  input: 'tell me about *search',
  output: (search) => $http(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${search}&utf8=&format=json&origin=*`)
    .then(response => {
      const id = response.data.query.search[0].pageid;
      return $http(`https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${id}&prop=extracts&exintro&explaintext&origin=*`)
        .then(response => {
          const extraction = response.data.query.pages[id].extract;
          const snippet = extraction.substring(0, 1000).split('. ').slice(0, -1).join('. ') + '.';
          return snippet;
        })
    })
}