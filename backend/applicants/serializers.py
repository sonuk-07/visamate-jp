from rest_framework import serializers
from .models import Applicant, Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Applicant
        fields = '__all__'
