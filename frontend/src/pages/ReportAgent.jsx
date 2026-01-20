import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle2, AlertCircle, Loader2, ArrowRight, Volume2, VolumeX } from 'lucide-react';

const ReportAgent = () => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);
    const audioRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        // Supported file extensions
        const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.dcm'];
        // Supported MIME types
        const validMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/bmp',
            'image/tiff',
            'image/x-tiff',
            'application/dicom',
            'application/x-dicom'
        ];

        const filtered = newFiles.filter(file => {
            // Check by MIME type
            if (validMimeTypes.includes(file.type)) {
                return true;
            }
            // Check by file extension (fallback for browsers that don't recognize MIME types)
            const fileName = file.name.toLowerCase();
            return validExtensions.some(ext => fileName.endsWith(ext));
        });

        if (filtered.length !== newFiles.length) {
            const rejectedCount = newFiles.length - filtered.length;
            alert(`${rejectedCount} file(s) were rejected. Supported formats: PDF, PNG, JPG, JPEG, BMP, TIFF, DICOM`);
        }

        setFiles(prev => [...prev, ...filtered].slice(0, 5)); // Limit to 5 files
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadStatus(null);
        setError(null);
        setResults([]);

        try {
            const uploadResults = [];

            // Process each file one at a time
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);

                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('user_id', 'report_user');

                    console.log(`Uploading ${file.name} to backend...`);
                    const response = await fetch('http://localhost:5000/api/report', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(`Response for ${file.name}:`, data);

                    if (data.success) {
                        uploadResults.push({
                            filename: file.name,
                            analysis: data.analysis,
                            audioUrl: data.audio_url,
                            imageUrl: data.image_url
                        });
                        console.log(`Successfully processed ${file.name}`);
                    } else {
                        uploadResults.push({
                            filename: file.name,
                            error: data.error || 'Failed to process file'
                        });
                        console.error(`Failed to process ${file.name}:`, data.error);
                    }
                } catch (fileError) {
                    console.error(`Error processing ${file.name}:`, fileError);
                    uploadResults.push({
                        filename: file.name,
                        error: fileError.message || 'Failed to upload file'
                    });
                }
            }

            setResults(uploadResults);

            // Check if all files failed
            const successCount = uploadResults.filter(r => !r.error).length;
            if (successCount === 0) {
                setUploadStatus('error');
                setError('All files failed to process. Please check the console for details.');
            } else if (successCount < uploadResults.length) {
                setUploadStatus('success');
                setError(`${successCount} of ${uploadResults.length} files processed successfully.`);
            } else {
                setUploadStatus('success');
            }

            // Auto-play the first successful result's audio
            const firstSuccess = uploadResults.find(r => !r.error && r.audioUrl);
            if (firstSuccess) {
                playAudio(firstSuccess.audioUrl);
            }
        } catch (err) {
            setUploadStatus('error');
            setError(err.message || 'Network error. Please check if the backend server is running.');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const playAudio = (url) => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        const fullUrl = `http://localhost:5000${url}`;
        const audio = new Audio(fullUrl);
        audioRef.current = audio;
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    return (
        <div className="pt-24 min-h-[calc(100vh-80px)] max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    Report <span className="text-gradient">Analysis Agent</span>
                </motion.h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Upload your medical reports, laboratory results, or prescriptions. Our AI will analyze them and provide detailed insights.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Area */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative glass-card rounded-3xl p-12 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center ${isDragging ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/10 hover:border-white/20'
                            }`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.dcm,application/pdf,image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />

                        <div className={`w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20 ${isDragging ? 'scale-110' : ''} transition-transform`}>
                            <Upload className="text-yellow-400 w-10 h-10" />
                        </div>

                        <h3 className="text-2xl font-bold mb-2">Click or Drag to Upload</h3>
                        <p className="text-gray-500 mb-6">Support for PDF, PNG, JPG, JPEG, BMP, TIFF, DICOM (Max 10MB per file)</p>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <FileText size={12} /> PDF
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <ImageIcon size={12} /> PNG
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <ImageIcon size={12} /> JPG/JPEG
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <ImageIcon size={12} /> BMP
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <ImageIcon size={12} /> TIFF
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <FileText size={12} /> DICOM
                            </div>
                        </div>
                    </motion.div>

                    {/* File List */}
                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 space-y-3"
                            >
                                {files.map((file, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center justify-between p-4 glass-card rounded-2xl bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                                {file.type.includes('pdf') ? <FileText className="text-yellow-400" size={20} /> : <ImageIcon className="text-yellow-400" size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white max-w-[200px] md:max-w-md truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                ))}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl font-bold flex items-center justify-center gap-2 text-black shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>Analyze Documents <ArrowRight size={20} /></>
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-6 border border-white/10">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-purple-400" size={20} />
                            What we analyze
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                Blood test results & Vital markers
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                Medical history & Doctor notes
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                Prescription clarity & Drug info
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                Radiology & Imaging reports
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card rounded-3xl p-6 border border-white/10 bg-purple-900/10">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-white">
                            <AlertCircle size={20} />
                            Privacy Note
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Your documents are processed securely using end-to-end encryption. No personal data is stored beyond the analysis session.
                        </p>
                    </div>

                    {uploadStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-sm flex gap-3"
                        >
                            <CheckCircle2 size={20} className="flex-shrink-0" />
                            Analysis completed successfully!
                        </motion.div>
                    )}

                    {uploadStatus === 'error' && error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex gap-3"
                        >
                            <AlertCircle size={20} className="flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Results Display */}
            {results && results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 space-y-6"
                >
                    <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
                    {results.map((result, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card rounded-3xl p-6 border border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="text-yellow-400" size={24} />
                                <h3 className="text-xl font-bold">{result.filename}</h3>
                            </div>
                            {result.error ? (
                                <div className="text-red-400">{result.error}</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-gray-300 whitespace-pre-wrap">
                                            {result.analysis}
                                        </div>
                                    </div>
                                    {result.audioUrl && (
                                        <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                                            <audio
                                                src={`http://localhost:5000${result.audioUrl}`}
                                                className="hidden"
                                                ref={idx === 0 ? audioRef : null}
                                            />
                                            <button
                                                onClick={() => isPlaying ? stopAudio() : playAudio(result.audioUrl)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isPlaying
                                                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                    }`}
                                            >
                                                {isPlaying ? (
                                                    <><VolumeX size={18} /> Stop Audio</>
                                                ) : (
                                                    <><Volume2 size={18} /> Listen to Analysis</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default ReportAgent;
