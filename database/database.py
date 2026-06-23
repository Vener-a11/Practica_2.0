import sqlite3
import os

DB_PATH = "./database/database.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_database():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            year INTEGER NOT NULL,
            genre TEXT NOT NULL,
            copies INTEGER DEFAULT 1,
            description TEXT
        )
    """)
    conn.commit()
    conn.close()

def get_all_books():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books ORDER BY id")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_book(title, author, year, genre, copies, description):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO books (title, author, year, genre, copies, description)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, author, year, genre, copies, description))
    conn.commit()
    book_id = cursor.lastrowid
    conn.close()
    return book_id

def update_book(book_id, title, author, year, genre, copies, description):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE books
        SET title=?, author=?, year=?, genre=?, copies=?, description=?
        WHERE id=?
    """, (title, author, year, genre, copies, description, book_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def delete_book(book_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted