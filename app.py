from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from database import database

app = FastAPI(title="Книжный каталог")

database.create_database()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse({"request": request}, "index.html")

@app.get("/api/books")
async def get_books():
    books = database.get_all_books()
    return JSONResponse(content=books)

@app.post("/api/books")
async def add_book(
    title: str = Form(...),
    author: str = Form(...),
    year: int = Form(...),
    genre: str = Form(...),
    copies: int = Form(1),
    description: str = Form("")
):
    book_id = database.add_book(title, author, year, genre, copies, description)
    return JSONResponse(content={"id": book_id, "message": "Книга добавлена"})

@app.put("/api/books/{book_id}")
async def update_book(
    book_id: int,
    title: str = Form(...),
    author: str = Form(...),
    year: int = Form(...),
    genre: str = Form(...),
    copies: int = Form(1),
    description: str = Form("")
):
    updated = database.update_book(book_id, title, author, year, genre, copies, description)
    if not updated:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    return JSONResponse(content={"message": "Книга обновлена"})

@app.delete("/api/books/{book_id}")
async def delete_book(book_id: int):
    deleted = database.delete_book(book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    return JSONResponse(content={"message": "Книга удалена"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)