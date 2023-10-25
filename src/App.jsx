import { useState, useEffect } from "react";

export default function App() {
  const [availableBooks, setAvailableBooks] = useState(JSON.parse(localStorage.getItem("available-books")) ?? []);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [favBooks, setFavBooks] = useState(JSON.parse(localStorage.getItem("favorite-books")) ?? []);
  const [genre, setGenre] = useState(localStorage.getItem("genre-selected") ?? "Todas");
  const [orderCheck, setOrderCheck] = useState(JSON.parse(localStorage.getItem("order-check")) ?? false);
  const [rangeValues, setRangeValues] = useState(JSON.parse(localStorage.getItem("range-values")) ?? {});
  const [range, setRange] = useState(JSON.parse(localStorage.getItem("range")) ?? 0);

  // FETCHING DE DATOS
  useEffect(() => {
    if (availableBooks.length === 0 && favBooks.length === 0) {
      fetch("http://localhost:5173/books.json")
      .then((res) => res.json())
      .then((data) => {
        // REESTRUCTURACIÓN DE LOS DATOS JSON
        const books = data.library.map((field) => {
          return {
            ...field.book,
            priority: false,
          }
        });
        setAvailableBooks(books);
        const ordered = books.sort((a, b) => a.pages - b.pages);
        const ranges = {
          min: ordered[0].pages,
          max: ordered[ordered.length - 1].pages,
        }
        setRangeValues(ranges);
        localStorage.setItem("range-values", JSON.stringify(ranges));
        setRange(ordered[ordered.length - 1].pages);
      })
      .catch((err) => console.log(err));
    }
  }, [availableBooks.length, favBooks.length]);

  // ESTILOS PERSONALIZADOS
  useEffect(() => {
    const ul = document.querySelector('.favorite-books')
    const div = document.querySelector('.favorite-books-container')
    if (ul && div) {
      const length = ul.children.length
      if (length === 1) {
        div.style.flexGrow = '1'
      } else if (length === 2) {
        div.style.flexGrow = '6'
      } else if (length > 2) {
        div.style.flexGrow = '18'
      }
    }
  });

  // ACTUALIZAR LA LISTA DE LIBROS SEGÚN EL FILTRO
  useEffect(() => {
    // CONTROLAR LA POSICIÓN DEL BUBBLE
    const inputRange = document.querySelector('#inputRange-pages');
    const bubble = document.querySelector(".range-value");
    const left = ((range - rangeValues.min) / (rangeValues.max - rangeValues.min)) * (inputRange.offsetWidth + (range/100) - bubble.offsetWidth) - 2.5;
    bubble.style.left = `${left}px`;

    // SE ACTUALIZA SI CAMBIA EL GÉNERO O SI CAMBIA EL N° DE PÁGINAS
    let newFilteredBooks = [...availableBooks].filter((book) => book.genre === genre);
    if (genre === "Todas") newFilteredBooks = [...availableBooks];
    newFilteredBooks = [...newFilteredBooks].filter((book) => book.pages <= range);
    setFilteredBooks(newFilteredBooks);
  }, [availableBooks, genre, range, rangeValues]);

  // SINCRONIZACIÓN ENTRE PESTAÑAS
  useEffect(() => {
    window.addEventListener('storage', (e) => {
      if (e.key === "genre-selected") {
        setGenre(e.newValue);
      } else if (e.key === "available-books") {
        setAvailableBooks(JSON.parse(e.newValue));
      } else if (e.key === "favorite-books") {
        setFavBooks(JSON.parse(e.newValue));
      } else if (e.key === "range") {
        setRange(JSON.parse(e.newValue));
      } else if (e.key === "order-check") {
        setOrderCheck(JSON.parse(e.newValue));
      }
    });
    return () => {
      window.removeEventListener('storage', (e) => {
        if (e.key === "genre-selected") {
          setGenre(e.newValue);
        } else if (e.key === "available-books") {
          setAvailableBooks(JSON.parse(e.newValue));
        } else if (e.key === "favorite-books") {
          setFavBooks(JSON.parse(e.newValue));
        } else if (e.key === "range") {
          setRange(JSON.parse(e.newValue));
        } else if (e.key === "order-check") {
          setOrderCheck(JSON.parse(e.newValue));
        }
      });
    }
  }, []);

  // ACTUALIZAR LA LISTA DE LECTURA SEGÚN EL ORDEN DE PRIORIDAD
  useEffect(() => {
    if (orderCheck) {
      const newFavBooks = [...favBooks].sort((a, b) => b.priority - a.priority);
      setFavBooks(newFavBooks);
    } else {
      const newFavBooks = [...favBooks].sort((a, b) => a.priority - b.priority);
      setFavBooks(newFavBooks);
    }
  // NO AÑADIR favBooks AL ARRAY DE DEPENDENCIAS
  }, [orderCheck]);

  function addBook (newBook) {
    const newFavBooks = [...favBooks, newBook];
    const newAvailableBooks = availableBooks.filter((book) => book.ISBN !== newBook.ISBN);
    setFavBooks(newFavBooks);
    setAvailableBooks(newAvailableBooks);
    localStorage.setItem("favorite-books", JSON.stringify(newFavBooks));
    localStorage.setItem("available-books", JSON.stringify(newAvailableBooks));
  }

  function removeBook (oldBook) {
    const newFavBooks = favBooks.filter((book) => book.ISBN !== oldBook.ISBN);
    const bookToRemove = {
      ...oldBook,
      priority: false,
    }
    const newAvailableBooks = [...availableBooks, bookToRemove];
    setFavBooks(newFavBooks);
    setAvailableBooks(newAvailableBooks);
    localStorage.setItem("favorite-books", JSON.stringify(newFavBooks));
    localStorage.setItem("available-books", JSON.stringify(newAvailableBooks));
  }

  function handlePriorityBook (e, book) {
    let newFavBooks = [...favBooks].map((favBook) => {
      if (favBook.ISBN === book.ISBN) {
        return {
          ...favBook,
          priority: e.currentTarget.checked,
        }
      } else {
        return favBook
      }
    });
    if (orderCheck) {
      newFavBooks = [...newFavBooks].sort((a, b) => b.priority - a.priority);
    }
    setFavBooks(newFavBooks);
    localStorage.setItem("favorite-books", JSON.stringify(newFavBooks));
  }

  function handleOrderByPriority (e) {
    const checked = e.currentTarget.checked;
    setOrderCheck(checked);
    if (checked) {
      const newFavBooks = [...favBooks].sort((a, b) => b.priority - a.priority);
      setFavBooks(newFavBooks);
    } else {
      const newFavBooks = [...favBooks].sort((a, b) => a.priority - b.priority);
      setFavBooks(newFavBooks);
    }
    localStorage.setItem("order-check", JSON.stringify(checked));
  }

  function handleGenre (e) {
    const optionSelected = e.currentTarget.value;
    setGenre(optionSelected);
    localStorage.setItem("genre-selected", optionSelected);
  }

  function handleRange (e) {
    const currentValue = e.currentTarget.value;
    setRange(currentValue);
    localStorage.setItem("range", JSON.stringify(currentValue));
  }

  return (
    <main>
      <section className={`books-section ${favBooks.length > 0 && "hasFavs"}`}>
        <div className="available-books-container container">
          <h2 className="title-available-books">
            Libros disponibles (
            {availableBooks.length > 0 && availableBooks.length})
          </h2>
          <div className="filters-container">
            <div className="filter-byGenre-container">
              <p>Filtrar por género:</p>
              <select name="" id="" onChange={handleGenre} value={genre}>
                <option value="Fantasía">Fantasía</option>
                <option value="Ciencia ficción">Ciencia ficción</option>
                <option value="Zombies">Zombies</option>
                <option value="Terror">Terror</option>
                <option value="Todas">Todas</option>
              </select>
              <p>Libros disponibles por género: <span>{filteredBooks.length}</span></p>
            </div>
            <div className="filter-byPages-container">
              <p>Filtrar por N° de páginas:</p>
              <div className="range-container">
                <div className="range-value">{range}</div>
                <input type="range" name="pages" id="inputRange-pages" min={rangeValues.min} max={rangeValues.max} onChange={handleRange} value={range} />
              </div>            
            </div>
          </div>
          <ul className="available-books">
            {filteredBooks.map((book) => {
              return (
                <li key={book.ISBN}>
                  <img
                    src={book.cover}
                    alt="image"
                    width={200}
                    height={275}
                    className="image-book"
                  />
                  <button
                    type="button"
                    onClick={() => addBook(book)}
                    className="add-book"
                    data-testid="add-book"
                  >
                    Añadir a la lista de lectura
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        {favBooks.length > 0 && (
          <div className="favorite-books-container container">
            <h2>Lista de lectura ({favBooks.length})</h2>
            <label htmlFor="order-byPriority" className="label-order">
              Ordenar por prioridad
              <input type="checkbox" name="" id="order-byPriority" onChange={handleOrderByPriority} checked={orderCheck} />
            </label>
            <hr />
            <ul className="favorite-books">
              {favBooks.map((book) => {
                return (
                  <li key={book.ISBN}>
                    <img
                      src={book.cover}
                      alt="image"
                      width={200}
                      height={275}
                      className="image-book"
                    />
                    <div className="buttons-container">
                      <button
                        type="button"
                        onClick={() => removeBook(book)}
                        className="add-book"
                        data-testid="add-book"
                      >
                        Quitar de la lista de lectura
                      </button>
                      <label htmlFor={`priority-checkbox-${book.ISBN}`}>
                        Marcar como prioridad
                        <input type="checkbox" name="" id={`priority-checkbox-${book.ISBN}`} onChange={(e, n = book) => handlePriorityBook(e, n)} checked={book.priority} />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
