import { useEffect, useState } from "react";
import BookModel from "../../models/AuctionModel";
import { SpinerLoading } from "../Utils/SpinerLoading";
import { SearchAuctions } from "./components/SearchAuctions";
import { Pagination } from "../Utils/Pagination";
import AuctionModel from "../../models/AuctionModel";

export const SearchAuctionsPage = () => {
  const [auctions, setAuctions] = useState<AuctionModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [httpError, setHttpError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
  const [totalAmountOfBooks, setTotalAmountOfBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [categorySelection,setCategorySelection] = useState('Book Category');

  useEffect(() => {
    const fetchBooks = async () => {
      const baseUrl: string = "http://localhost:8080/api/auctions";

      let url: string = "";

      if (searchUrl === "") {
        url = `${baseUrl}?page=${currentPage - 1}&size=${booksPerPage}`;
      } else {
        let searchWithPage = searchUrl.replace('<pageNumber>',`${currentPage-1}`);
        url = baseUrl + searchWithPage;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Something went wrong!");
      }

      const responseJson = await response.json();

      const responseData = responseJson._embedded.auctions;

      setTotalAmountOfBooks(responseJson.page.totalElements);
      setTotalPages(responseJson.page.totalPages);

      const loadedBooks: BookModel[] = [];

      for (const key in responseData) {
        loadedBooks.push({
          id: responseData[key].id,
          closingTime: responseData[key].closingTime,
          createdTime: responseData[key].createdTime,
          startingPrice: responseData[key].startingPrice,
          name: responseData[key].name,
          description: responseData[key].description,
          category: responseData[key].category,
          img: responseData[key].img,
          userName: responseData[key].userName,
        });
      }

      setAuctions(loadedBooks);
      setIsLoading(false);
    };
    fetchBooks().catch((error: any) => {
      setIsLoading(false);
      setHttpError(error.message);
    });
    window.scrollTo(0, 0);
  }, [currentPage, searchUrl]);

  if (isLoading) {
    return <SpinerLoading />;
  }

  if (httpError) {
    return (
      <div className="container m-5">
        <p>{httpError}</p>
      </div>
    );
  }

  const searchHandleChange = () => {
    setCurrentPage(1);
    if (search === "") {
      setSearchUrl("");
    } else {
      setSearchUrl(
        `/search/findByTitleContaining?title=${search}&page=<pageNumber>&size=${booksPerPage}`
      );
      setCategorySelection('Book Category')
    }
  };

  const categoryField = (value: string) => {
    setCurrentPage(1);
    if(value === 'Electronic' || 
       value === 'Fashion & Beauty' ||
       value === 'Agriculture' ||
       value === 'Home & Garden')
      {
       setCategorySelection(value);
       setSearchUrl(`/search/findByCategory?category=${value}&page=0&size=${booksPerPage}`)
       
    }else{
      setCategorySelection('All');
      setSearchUrl(`?page=<pageNumber>&size=${booksPerPage}`);
    }
  }

  const indexOfLastBook: number = currentPage * booksPerPage;
  const indexOfFirstBook: number = indexOfLastBook - booksPerPage;
  let lastItem =
    booksPerPage * currentPage <= totalAmountOfBooks
      ? booksPerPage * currentPage
      : totalAmountOfBooks;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="container">
        <div>
          <div className="row mt-5">
            <div className="col-6">
              <div className="d-flex">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-labelledby="Search"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  className="btn btn-outline-success"
                  onClick={() => searchHandleChange()}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="col-4">
              <div className="dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {categorySelection}
                </button>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton1"
                >
                  <li onClick={() => categoryField('All')}>
                    <a className="dropdown-item" href="#">
                      All
                    </a>
                  </li>
                  <li onClick={() => categoryField('Electronic')}>
                    <a className="dropdown-item" href="#">
                    Electronic
                    </a>
                  </li >
                  <li onClick={() => categoryField('Fashion & Beauty')}>
                    <a className="dropdown-item" href="#">
                    Fashion & Beauty
                    </a>
                  </li>
                  <li onClick={() => categoryField('Agriculture')}>
                    <a className="dropdown-item" href="#">
                    Agriculture
                    </a>
                  </li>
                  <li onClick={() => categoryField('Home & Garden')}>
                    <a className="dropdown-item" href="#">
                    Home & Garden
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {totalAmountOfBooks > 0 ? (
            <>
              <div className="mt-3">
                <h5>Number of results: {totalAmountOfBooks}</h5>
              </div>
              <p>
                {indexOfFirstBook} to {lastItem} of {totalAmountOfBooks} items:
              </p>
              {auctions.map((auction) => (
                <SearchAuctions auction={auction} key={auction.id} />
              ))}
            </>
          ) : (
            <div className="m-5">
              <h3>Can't find what you are looking for?</h3>
              <a
                type="button"
                className="btn main color btn-md px-4 me-md-2 fw-bold text-white"
                href="#"
              >
                Libarary Services
              </a>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
