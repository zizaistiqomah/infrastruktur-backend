const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json()); // Parsing JSON dari request body

// Setup penyimpanan file menggunakan multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder penyimpanan file gambar
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
    }
});

const upload = multer({ storage: storage });

// Konfigurasi koneksi database MySQL
const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "laporan_infrastruktur",
});

database.connect((err) => {
    if (err) throw err;
    console.log("Database connected");
});

// API untuk menambahkan data laporan (POST)
app.post("/api/v1/formlaporan", upload.single('Gambar'), (req, res) => {
    const { Nama, Tanggal, Kategori, Lokasi, DetailKerusakan } = req.body;
    const Gambar = req.file ? req.file.filename : null;

    // Validasi input, kecuali gambar
    if (!Nama || !Tanggal || !Kategori || !Lokasi || !DetailKerusakan) {
        return res.status(400).json({ success: false, message: "All fields except image are required" });
    }

    // Query berbeda jika ada gambar atau tidak
    const query = Gambar
        ? "INSERT INTO formlaporan (Nama, Tanggal, Kategori, Lokasi, DetailKerusakan, Gambar) VALUES (?, ?, ?, ?, ?, ?)"
        : "INSERT INTO formlaporan (Nama, Tanggal, Kategori, Lokasi, DetailKerusakan) VALUES (?, ?, ?, ?, ?)";

    const values = Gambar
        ? [Nama, Tanggal, Kategori, Lokasi, DetailKerusakan, Gambar]
        : [Nama, Tanggal, Kategori, Lokasi, DetailKerusakan];

    database.query(query, values, (err, result) => {
        if (err) throw err;
        res.json({
            success: true,
            message: "Data has been inserted successfully",
            data: result,
        });
    });
});

// API untuk mendapatkan semua data laporan (GET)
app.get("/api/v1/formlaporan", (req, res) => {
    database.query("SELECT * FROM formlaporan", (err, rows) => {
        if (err) throw err;
        res.json({
            success: true,
            message: "Getting all laporan data",
            data: rows,
        });
    });
});

// Menyediakan akses ke folder gambar yang diunggah
app.use('/uploads', express.static('uploads'));

// Jalankan server di port 3002
app.listen(3002, () => {
    console.log("Server is running on port 3002");
});
