import React, { useState, useEffect, useCallback } from 'react';
import {IconButton, Box, Text } from "@chakra-ui/react";
import { getDistinguishableColor, getReverseColor } from "../const/colors";
import { Palette } from 'lucide-react';


interface ColorState {
    contrastingColor: string;
    reverseColor: string;
    hoverColor: string;
  }

export const useColorManagement = () => {
    const [colorState, setColorState] = useState<ColorState>({
      contrastingColor: '#000000',
      reverseColor: '#ffffff',
      hoverColor: '#e2e8f0',
    });
  
     const updateColors = useCallback((baseColor: string) => {
      const newContrastingColor = getDistinguishableColor(`#${baseColor.slice(-6)}`, '#e2e8f0');
      setColorState({
        contrastingColor: newContrastingColor,
        reverseColor: getReverseColor(newContrastingColor),
        hoverColor: getReverseColor(newContrastingColor, 0.2),
      });
    }, []);
  
     const cycleColors = useCallback(() => {
      const currentHue = parseInt(colorState.contrastingColor.slice(1), 16);
      const newHue = (currentHue + 0.08 * 16777215) % 16777215;
      const noise = Math.floor(Math.random() * 1000);
      const newColor = Math.floor(newHue + noise).toString(16).padStart(6, '0');
      updateColors(newColor);
    }, [colorState.contrastingColor, updateColors]);
  
    return { colorState, updateColors, cycleColors };
  };
  
  export const PaletteButton: React.FC<{ 
    cycleColors: () => void, 
    contrastingColor: string,
    reverseColor: string
  }> = ({ cycleColors, contrastingColor, reverseColor }) => {
    const [isHovering, setIsHovering] = useState(false);
  
    useEffect(() => {
      let intervalId: NodeJS.Timeout;
      if (isHovering) {
        intervalId = setInterval(cycleColors, 100);
      }
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [isHovering, cycleColors]);
  
    return (
      <IconButton
        aria-label="Cycle Colors"
        icon={<Palette size={18} />}
        onClick={cycleColors}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        size="md"
        isRound={true}
        color={reverseColor}
        bg={contrastingColor}
        _hover={{ bg: reverseColor, color: contrastingColor }}
        transition="all 0.2s"
      />
    );
  };
  
  export const NodeDetails: React.FC<{ node: NodeState }> = ({ node }) => (
    <Box p={4} borderWidth={1} borderRadius="lg">
      <Text fontWeight="bold" fontSize="xl">{node.nodeId}</Text>
      <Text>Inflation: {node.inflation}</Text>
      <Text>Balance Anchor: {node.balanceAnchor}</Text>
      <Text>Balance Budget: {node.balanceBudget}</Text>
      <Text>Value: {node.value}</Text>
      <Text>Membrane ID: {node.membraneId}</Text>
      <Text>Members: {node.membersOfNode.join(', ')}</Text>
      <Text>Children: {node.childrenNodes.join(', ')}</Text>
      <Text>Root Path: {node.rootPath.join(' > ')}</Text>
    </Box>
  );
  
  export const ActivityLogs: React.FC = () => (
    <Box p={4}>
      <Text fontWeight="bold" fontSize="xl">Activity Logs</Text>
      <Text mt={4}>This is a placeholder for the Activity Logs page.</Text>
    </Box>
  );