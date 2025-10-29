
// TODO: Byt ut @nextui-org/react mot @heroui/react när tid finns.
// @nextui-org/react är föråldrat och bör bytas ut för att säkerställa långsiktig stabilitet och tillgång till nya funktioner.

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { useSession } from "next-auth/react"; // Korrekt import för session-hantering
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/client';

interface SetHourlyRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SetHourlyRateModal: React.FC<SetHourlyRateModalProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession(); // Använder useSession för att hämta användardata
  const user = session?.user; // Hämtar användarobjektet från sessionen
  const [hourlyRate, setHourlyRate] = useState('');

  const handleSave = async () => {
    // Kontrollerar att användaren och UID finns innan vi anropar databasen
    if (user && user.id && hourlyRate) { 
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, {
          hourlyRate: Number(hourlyRate)
        });
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
