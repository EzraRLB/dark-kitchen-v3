# users/serializers.py
from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_id','first_name','middle_name','last_name','email','role','created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ('first_name','middle_name','last_name','email','role','password')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email ya registrado")
        return value

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        # usando make_password para cumplir tu requisito
        validated_data['password'] = make_password(pwd)
        user = User.objects.create(**validated_data)
        return user
