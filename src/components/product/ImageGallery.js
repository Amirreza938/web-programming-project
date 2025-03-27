import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handlePrevImage = () => {
    setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handleNextImage(); // In RTL mode, ArrowLeft is next
    } else if (e.key === 'ArrowRight') {
      handlePrevImage(); // In RTL mode, ArrowRight is previous
    } else if (e.key === 'Escape') {
      setShowModal(false);
    }
  };

  return (
    <div className="product-gallery">
      <div 
        className="position-relative"
        style={{ cursor: 'zoom-in' }}
        onClick={() => setShowModal(true)}
      >
        <img 
          src={images[selectedImage]} 
          alt="Product" 
          className="main-image"
        />
      </div>

      <div className="thumbnail-container">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index + 1}`}
            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </div>

      {/* Image Viewer Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="xl" 
        centered
        onKeyDown={handleKeyDown}
      >
        <Modal.Body className="p-0 position-relative">
          <Button 
            variant="light" 
            className="position-absolute top-0 end-0 m-2 rounded-circle" 
            style={{ width: '40px', height: '40px', padding: '0' }}
            onClick={() => setShowModal(false)}
          >
            <FaTimes />
          </Button>
          
          <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <img 
              src={images[selectedImage]} 
              alt="Product" 
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <Button
            variant="light"
            className="position-absolute start-0 top-50 translate-middle-y m-2 rounded-circle"
            style={{ width: '40px', height: '40px', padding: '0' }}
            onClick={handleNextImage}
          >
            <FaArrowLeft />
          </Button>
          
          <Button
            variant="light"
            className="position-absolute end-0 top-50 translate-middle-y m-2 rounded-circle"
            style={{ width: '40px', height: '40px', padding: '0' }}
            onClick={handlePrevImage}
          >
            <FaArrowRight />
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ImageGallery;
