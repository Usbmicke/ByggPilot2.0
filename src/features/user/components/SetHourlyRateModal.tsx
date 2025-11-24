
// TODO: Byt ut @nextui-org/react mot @heroui/react när tid finns.
// @nextui-org/react är föråldrat och bör bytas ut för att säkerställa långsiktig stabilitet och tillgång till nya funktioner.

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import React, { useState } from 'react';

interface SetHourlyRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SetHourlyRateModal: React.FC<SetHourlyRateModalProps> = ({ isOpen, onClose }) => {
  const [hourlyRate, setHourlyRate] = useState('');

  const handleSave = async () => {
    if (hourlyRate) {
      try {
        // This functionality depends on a user session, which is no longer available.
        // The code is left here as a placeholder for a future implementation.
        // For now, we will simulate a successful API call.
        console.log("Simulating hourly rate update with: ", hourlyRate);
        await new Promise(resolve => setTimeout(resolve, 1000)); 

        console.log('Timpris sparat!');
        onClose();
      } catch (error) {
        console.error('Fel vid sparning av timpris:', error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Ange ditt standardtimpris</ModalHeader>
        <ModalBody>
          <Input
            type="number"
            label="Timpris (SEK)"
            placeholder="Ange ditt timpris"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Avbryt
          </Button>
          <Button color="primary" onPress={handleSave}>
            Spara
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SetHourlyRateModal;
