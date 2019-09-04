export const dataSearch = {
  input: 'tell me about *search',
  output: (search) => $http(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${search}&utf8=&format=json&origin=*`)
    .then((response) => {
      console.log(response);
      return response.data.query.search[0].snippet.replace(/<\/?[^>]+(>|$)/g, '');
    })
}